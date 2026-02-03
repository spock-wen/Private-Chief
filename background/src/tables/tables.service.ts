import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { TableStatus } from '@prisma/client';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async create(createTableDto: CreateTableDto) {
    const { hostName, ...tableData } = createTableDto;
    const table = await this.prisma.table.create({
      data: {
        ...tableData,
        time: new Date(createTableDto.time),
        status: TableStatus.PLANNING,
        guests: {
          create: {
            sessionId: createTableDto.hostSessionId,
            name: hostName,
          },
        },
      },
    });

    return table;
  }

  async findAll(sessionId?: string) {
    const where = sessionId ? { hostSessionId: sessionId } : {};
    return this.prisma.table.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        candidateDishes: true,
        finalDishes: true,
        guests: {
          include: {
            votes: true,
          },
        },
      },
    });

    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }

    return table;
  }

  private async checkHostPermission(tableId: string, sessionId: string) {
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
      select: { hostSessionId: true },
    });

    if (!table) {
      throw new NotFoundException(`Table with ID ${tableId} not found`);
    }

    if (table.hostSessionId !== sessionId) {
      throw new ForbiddenException('Only the host can perform this action');
    }
  }

  async updateStatus(id: string, status: TableStatus, sessionId: string) {
    const table = await this.findOne(id);
    await this.checkHostPermission(id, sessionId);

    // 状态流转校验 (Planning -> Voting -> Locked -> Archived)
    // 允许跳过状态，但不允许回退（业务需求通常如此，除特殊情况外）
    const statusOrder = [
      TableStatus.PLANNING,
      TableStatus.VOTING,
      TableStatus.LOCKED,
      TableStatus.ARCHIVED,
    ];

    if (statusOrder.indexOf(status) < statusOrder.indexOf(table.status)) {
      throw new ForbiddenException('Cannot move to a previous status');
    }

    return this.prisma.table.update({
      where: { id },
      data: { status },
    });
  }

  async updateCandidates(id: string, dishIds: string[], sessionId: string) {
    const table = await this.findOne(id);
    await this.checkHostPermission(id, sessionId);

    // Voting 状态下锁定菜单编辑
    if (table.status !== TableStatus.PLANNING) {
      throw new ForbiddenException(
        'Cannot edit candidate dishes after planning phase',
      );
    }

    return this.prisma.table.update({
      where: { id },
      data: {
        candidateDishes: {
          set: dishIds.map((dishId) => ({ id: dishId })),
        },
      },
      include: {
        candidateDishes: true,
      },
    });
  }

  async setFinalDishes(id: string, dishIds: string[], sessionId: string) {
    const table = await this.findOne(id);
    await this.checkHostPermission(id, sessionId);

    // 只有在锁定或归档前可以设置最终名单
    if (table.status === TableStatus.ARCHIVED) {
      throw new ForbiddenException('Cannot edit menu after table is archived');
    }

    return this.prisma.table.update({
      where: { id },
      data: {
        finalDishes: {
          set: dishIds.map((dishId) => ({ id: dishId })),
        },
      },
      include: {
        finalDishes: true,
      },
    });
  }

  async setFinalSelection(id: string, dishIds: string[], sessionId: string) {
    const table = await this.findOne(id);
    await this.checkHostPermission(id, sessionId);

    // 只有在归档前可以设置最终名单
    if (table.status === TableStatus.ARCHIVED) {
      throw new ForbiddenException('Cannot edit menu after table is archived');
    }

    return this.prisma.table.update({
      where: { id },
      data: {
        finalDishIds: dishIds,
      },
    });
  }

  async updateBilling(id: string, totalExpense: number, sessionId: string) {
    const table = await this.findOne(id);
    await this.checkHostPermission(id, sessionId);

    if (
      table.status !== TableStatus.LOCKED &&
      table.status !== TableStatus.ARCHIVED
    ) {
      throw new ForbiddenException(
        'Billing can only be set after table is locked or archived',
      );
    }

    const guestCount = table.guests.length;
    const perPerson = guestCount > 0 ? totalExpense / guestCount : 0;

    const updatedTable = await this.prisma.table.update({
      where: { id },
      data: { totalExpense },
    });

    return {
      ...updatedTable,
      guestCount,
      perPerson: parseFloat(perPerson.toFixed(2)),
    };
  }
}
