import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TableStatus } from '@prisma/client';

@Injectable()
export class VotesService {
  constructor(private prisma: PrismaService) {}

  async vote(tableId: string, sessionId: string, dishId: string) {
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });
    if (!table) throw new NotFoundException('Table not found');

    // 锁定投票权限校验
    if (table.status !== TableStatus.VOTING) {
      throw new ForbiddenException('Voting is not open for this table');
    }

    const guest = await this.prisma.guest.findFirst({
      where: { tableId, sessionId },
    });
    if (!guest) throw new ForbiddenException('You must join the table first');

    return this.prisma.vote.upsert({
      where: {
        guestId_dishId_tableId: {
          guestId: guest.id,
          dishId,
          tableId,
        },
      },
      create: {
        guestId: guest.id,
        dishId,
        tableId,
      },
      update: {}, // 如果已存在则不操作
    });
  }

  async unvote(tableId: string, sessionId: string, dishId: string) {
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });
    if (!table) throw new NotFoundException('Table not found');

    if (table.status !== TableStatus.VOTING) {
      throw new ForbiddenException('Voting is locked');
    }

    const guest = await this.prisma.guest.findFirst({
      where: { tableId, sessionId },
    });
    if (!guest) throw new ForbiddenException('Guest not found');

    return this.prisma.vote.delete({
      where: {
        guestId_dishId_tableId: {
          guestId: guest.id,
          dishId,
          tableId,
        },
      },
    });
  }

  async getHeatmap(tableId: string) {
    const votes = await this.prisma.vote.groupBy({
      by: ['dishId'],
      where: { tableId },
      _count: {
        id: true,
      },
    });

    return votes.map((v: { dishId: string; _count: { id: number } }) => ({
      dishId: v.dishId,
      count: v._count.id,
    }));
  }
}
