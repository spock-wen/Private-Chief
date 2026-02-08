import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { TableStatus } from '@prisma/client';
import { FamiliesService } from '../families/families.service';

@Injectable()
export class TablesService {
  constructor(
    private prisma: PrismaService,
    private familiesService: FamiliesService,
  ) {}

  /**
   * 创建饭桌
   * - 需要是家庭的管理员或主人
   * - 自动继承家庭的位置信息（如果未提供）
   */
  async create(createTableDto: CreateTableDto, userId: string, sessionId: string) {
    const { hostName, familyId, ...tableData } = createTableDto;

    // 验证权限：只有管理员和主人可以创建饭桌
    await this.familiesService.checkAdminPermission(familyId, userId);

    // 获取家庭信息，用于继承位置
    const family = await this.familiesService.findOne(familyId);

    // 如果未提供位置信息，则从家庭继承
    const locationData = {
      address: tableData.address || family.address,
      addressDetail: tableData.addressDetail || family.addressDetail,
      latitude: tableData.latitude ?? family.latitude,
      longitude: tableData.longitude ?? family.longitude,
    };

    const table = await this.prisma.table.create({
      data: {
        ...tableData,
        ...locationData,
        familyId,
        creatorId: userId,
        time: new Date(createTableDto.time),
        status: TableStatus.PLANNING,
        guests: {
          create: {
            sessionId: sessionId,
            name: hostName,
          },
        },
      },
      include: {
        family: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    });

    return table;
  }

  /**
   * 查询饭桌列表
   * - 可以按家庭ID或创建者ID筛选
   */
  async findAll(query?: { familyId?: string; userId?: string }) {
    const where: any = {};

    if (query?.familyId) {
      where.familyId = query.familyId;
    }

    if (query?.userId) {
      where.creatorId = query.userId;
    }

    return this.prisma.table.findMany({
      where,
      include: {
        family: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            guests: true,
            candidateDishes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        family: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
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

  /**
   * 检查创建者权限
   * - 只有饭桌的创建者可以执行某些操作
   */
  private async checkCreatorPermission(tableId: string, userId: string) {
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
      select: { creatorId: true, familyId: true },
    });

    if (!table) {
      throw new NotFoundException(`Table with ID ${tableId} not found`);
    }

    if (table.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can perform this action');
    }

    return table;
  }

  /**
   * 检查管理员权限
   * - 饭桌的创建者或家庭的管理员/主人可以执行某些操作
   */
  private async checkAdminOrCreatorPermission(tableId: string, userId: string) {
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
      select: { creatorId: true, familyId: true },
    });

    if (!table) {
      throw new NotFoundException(`Table with ID ${tableId} not found`);
    }

    // 如果是饭桌创建者，直接通过
    if (table.creatorId === userId) {
      return table;
    }

    // 否则检查是否是家庭管理员
    await this.familiesService.checkAdminPermission(table.familyId, userId);

    return table;
  }

  /**
   * 更新饭桌状态
   * - 只有饭桌创建者或家庭管理员可以操作
   */
  async updateStatus(id: string, status: TableStatus, userId: string) {
    const table = await this.findOne(id);
    await this.checkAdminOrCreatorPermission(id, userId);

    // 状态流转校验 (Planning -> Voting -> Locked -> Archived)
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

  /**
   * 更新候选菜品
   * - 只有饭桌创建者或家庭管理员可以操作
   * - 只能在 PLANNING 阶段修改
   */
  async updateCandidates(id: string, dishIds: string[], userId: string) {
    const table = await this.findOne(id);
    await this.checkAdminOrCreatorPermission(id, userId);

    // Voting 状态下锁定菜单编辑
    if (table.status !== TableStatus.PLANNING) {
      throw new ForbiddenException(
        'Cannot edit candidate dishes after planning phase',
      );
    }

    // 验证所有菜品都属于该家庭
    const dishes = await this.prisma.dish.findMany({
      where: {
        id: { in: dishIds },
        familyId: table.familyId,
      },
    });

    if (dishes.length !== dishIds.length) {
      throw new ForbiddenException(
        'All dishes must belong to the same family as the table',
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

  async setFinalDishes(id: string, dishIds: string[], userId: string) {
    const table = await this.findOne(id);
    await this.checkAdminOrCreatorPermission(id, userId);

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

  async setFinalSelection(id: string, dishIds: string[], userId: string) {
    const table = await this.findOne(id);
    await this.checkAdminOrCreatorPermission(id, userId);

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

  async updateBilling(id: string, totalExpense: number, userId: string) {
    const table = await this.findOne(id);
    await this.checkAdminOrCreatorPermission(id, userId);

    if (
      table.status !== TableStatus.LOCKED &&
      table.status !== TableStatus.ARCHIVED
    ) {
      throw new ForbiddenException(
        'Billing can only be set after table is locked or archived',
      );
    }

    const guestCount = table.guests.length;

    if (guestCount === 0) {
      throw new ForbiddenException('暂无参与客人，无法计算 AA');
    }

    const perPerson = totalExpense / guestCount;

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
