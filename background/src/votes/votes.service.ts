import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TableStatus } from '@prisma/client';
import { VotesGateway } from './votes.gateway';

@Injectable()
export class VotesService {
  constructor(
    private prisma: PrismaService,
    private votesGateway: VotesGateway,
  ) {}

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

    const vote = await this.prisma.vote.upsert({
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

    // 广播投票更新事件
    this.votesGateway.broadcastVoteUpdate(tableId, {
      action: 'vote',
      dishId,
      guestId: guest.id,
      guestName: guest.name,
    });

    return vote;
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

    const result = await this.prisma.vote.delete({
      where: {
        guestId_dishId_tableId: {
          guestId: guest.id,
          dishId,
          tableId,
        },
      },
    });

    // 广播取消投票事件
    this.votesGateway.broadcastVoteUpdate(tableId, {
      action: 'unvote',
      dishId,
      guestId: guest.id,
      guestName: guest.name,
    });

    return result;
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
