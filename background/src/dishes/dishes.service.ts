import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Category } from '@prisma/client';

@Injectable()
export class DishesService {
  constructor(private prisma: PrismaService) {}

  async create(createDishDto: CreateDishDto) {
    return this.prisma.dish.create({
      data: createDishDto,
    });
  }

  async findAll(query?: { name?: string; category?: Category; tags?: string[] }) {
    const where: any = {};

    if (query?.name) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }

    if (query?.category) {
      where.category = query.category;
    }

    if (query?.tags && query.tags.length > 0) {
      where.tags = { hasSome: query.tags };
    }

    return this.prisma.dish.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.dish.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateDishDto: UpdateDishDto) {
    return this.prisma.dish.update({
      where: { id },
      data: updateDishDto,
    });
  }

  async remove(id: string) {
    return this.prisma.dish.delete({
      where: { id },
    });
  }

  async removeMany(ids: string[]) {
    return this.prisma.dish.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
