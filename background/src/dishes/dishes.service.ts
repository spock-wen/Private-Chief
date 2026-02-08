import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Category, Prisma } from '@prisma/client';
import { FamiliesService } from '../families/families.service';

@Injectable()
export class DishesService {
  constructor(
    private prisma: PrismaService,
    private familiesService: FamiliesService,
  ) {}

  /**
   * 创建菜品
   * - 需要是家庭的管理员或主人
   */
  async create(createDishDto: CreateDishDto, userId: string) {
    const { familyId, ...dishData } = createDishDto;

    // 验证权限：只有管理员和主人可以创建菜品
    await this.familiesService.checkAdminPermission(familyId, userId);

    return this.prisma.dish.create({
      data: {
        ...dishData,
        familyId,
        createdBy: userId,
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
  }

  /**
   * 查询菜品列表
   * - 支持按家庭、名称、分类、标签筛选
   */
  async findAll(
    query?: {
      familyId?: string;
      name?: string;
      category?: Category;
      tags?: string[];
    },
    userId?: string,
  ) {
    const where: Prisma.DishWhereInput = {};

    // 如果指定了家庭ID，验证用户是否是该家庭成员
    if (query?.familyId) {
      if (userId) {
        await this.familiesService.checkMemberPermission(query.familyId, userId);
      }
      where.familyId = query.familyId;
    }

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
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取单个菜品详情
   */
  async findOne(id: string) {
    const dish = await this.prisma.dish.findUnique({
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
      },
    });

    if (!dish) {
      throw new NotFoundException(`Dish with ID ${id} not found`);
    }

    return dish;
  }

  /**
   * 更新菜品
   * - 需要是家庭的管理员或主人
   */
  async update(id: string, updateDishDto: UpdateDishDto, userId: string) {
    const dish = await this.findOne(id);

    // 验证权限：只有管理员和主人可以修改菜品
    await this.familiesService.checkAdminPermission(dish.familyId, userId);

    return this.prisma.dish.update({
      where: { id },
      data: updateDishDto,
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
  }

  /**
   * 删除菜品
   * - 需要是家庭的管理员或主人
   */
  async remove(id: string, userId: string) {
    const dish = await this.findOne(id);

    // 验证权限：只有管理员和主人可以删除菜品
    await this.familiesService.checkAdminPermission(dish.familyId, userId);

    return this.prisma.dish.delete({
      where: { id },
    });
  }

  /**
   * 批量删除菜品
   * - 需要是家庭的管理员或主人
   * - 所有菜品必须属于同一个家庭
   */
  async removeMany(ids: string[], userId: string) {
    // 获取所有菜品
    const dishes = await this.prisma.dish.findMany({
      where: { id: { in: ids } },
      select: { id: true, familyId: true },
    });

    if (dishes.length === 0) {
      throw new NotFoundException('No dishes found');
    }

    // 检查所有菜品是否属于同一个家庭
    const familyIds = [...new Set(dishes.map((d) => d.familyId))];
    if (familyIds.length > 1) {
      throw new ForbiddenException('All dishes must belong to the same family');
    }

    // 验证权限
    await this.familiesService.checkAdminPermission(familyIds[0], userId);

    return this.prisma.dish.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
