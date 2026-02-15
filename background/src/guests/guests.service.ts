import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JoinTableDto } from './dto/join-table.dto';

@Injectable()
export class GuestsService {
  constructor(private prisma: PrismaService) {}

  async joinTable(
    tableId: string,
    joinTableDto: JoinTableDto,
    userId?: string,
  ) {
    const { sessionId, name, preferences } = joinTableDto;

    // 匿名用户必须提供昵称
    if (!userId && !name?.trim()) {
      throw new BadRequestException('请输入昵称');
    }

    // 校验饭桌存在
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });
    if (!table) {
      throw new NotFoundException('饭桌不存在');
    }

    // 已登录用户：按 userId 合并（多设备同一人）
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { nickname: true },
      });
      const displayName = name?.trim() || user?.nickname || '访客';

      const existingByUserId = await this.prisma.guest.findFirst({
        where: { tableId, userId },
      });

      if (existingByUserId) {
        // 同用户新设备：更新 sessionId 和 name
        return this.prisma.guest.update({
          where: { id: existingByUserId.id },
          data: { sessionId, name: displayName, preferences },
          include: { votes: true },
        });
      }

      const existingBySessionId = await this.prisma.guest.findFirst({
        where: { tableId, sessionId },
      });

      if (existingBySessionId) {
        // 匿名先加入后登录：补上 userId
        return this.prisma.guest.update({
          where: { id: existingBySessionId.id },
          data: { userId, name: displayName, preferences },
          include: { votes: true },
        });
      }

      return this.prisma.guest.create({
        data: {
          tableId,
          sessionId,
          userId,
          name: displayName,
          preferences,
        },
        include: { votes: true },
      });
    }

    // 匿名用户：仅按 sessionId
    const existingGuest = await this.prisma.guest.findFirst({
      where: { tableId, sessionId },
    });

    if (existingGuest) {
      return this.prisma.guest.update({
        where: { id: existingGuest.id },
        data: { name: name!.trim(), preferences },
        include: { votes: true },
      });
    }

    return this.prisma.guest.create({
      data: {
        tableId,
        sessionId,
        name: name!.trim(),
        preferences,
      },
      include: { votes: true },
    });
  }

  async findByTable(tableId: string) {
    return this.prisma.guest.findMany({
      where: { tableId },
      include: {
        votes: true,
      },
    });
  }
}
