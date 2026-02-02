import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JoinTableDto } from './dto/join-table.dto';

@Injectable()
export class GuestsService {
  constructor(private prisma: PrismaService) {}

  async joinTable(tableId: string, joinTableDto: JoinTableDto) {
    const { sessionId, name, preferences } = joinTableDto;

    // 检查是否已经加入过
    const existingGuest = await this.prisma.guest.findFirst({
      where: {
        tableId,
        sessionId,
      },
    });

    if (existingGuest) {
      // 更新信息（如改名或改偏好）
      return this.prisma.guest.update({
        where: { id: existingGuest.id },
        data: { name, preferences },
      });
    }

    // 新加入
    return this.prisma.guest.create({
      data: {
        tableId,
        sessionId,
        name,
        preferences,
      },
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
