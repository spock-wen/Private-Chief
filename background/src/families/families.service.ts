import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { FamilyMemberRole } from '@prisma/client';

@Injectable()
export class FamiliesService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建家庭
   */
  async create(createFamilyDto: CreateFamilyDto, userId: string) {
    const family = await this.prisma.family.create({
      data: {
        ...createFamilyDto,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: FamilyMemberRole.OWNER,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return family;
  }

  /**
   * 获取用户的所有家庭
   */
  async findAllByUser(userId: string) {
    const families = await this.prisma.family.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            members: true,
            dishes: true,
            tables: true,
          },
        },
        members: {
          where: {
            userId,
          },
          select: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 添加用户在该家庭的角色
    return families.map((family) => ({
      ...family,
      role: family.members[0]?.role,
      members: undefined, // 移除 members 字段，只保留 role
    }));
  }

  /**
   * 获取家庭详情
   */
  async findOne(id: string, userId?: string) {
    const family = await this.prisma.family.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        _count: {
          select: {
            dishes: true,
            tables: true,
          },
        },
      },
    });

    if (!family) {
      throw new NotFoundException(`Family with ID ${id} not found`);
    }

    // 如果提供了 userId，检查用户是否是成员
    if (userId) {
      const isMember = family.members.some((m) => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenException('You are not a member of this family');
      }
    }

    return family;
  }

  /**
   * 更新家庭信息
   * 主人和管理员均可修改
   */
  async update(id: string, updateFamilyDto: UpdateFamilyDto, userId: string) {
    await this.checkAdminPermission(id, userId);

    const family = await this.prisma.family.update({
      where: { id },
      data: updateFamilyDto,
      include: {
        owner: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return family;
  }

  /**
   * 删除家庭
   */
  async remove(id: string, userId: string) {
    // 检查是否是主人
    await this.checkOwnerPermission(id, userId);

    await this.prisma.family.delete({
      where: { id },
    });

    return { message: 'Family deleted successfully' };
  }

  /**
   * 生成邀请码
   */
  async createInvitation(familyId: string, createInvitationDto: CreateInvitationDto, userId: string) {
    const { maxUses = 1, expiresInDays = 7 } = createInvitationDto;

    // 检查是否是主人
    await this.checkOwnerPermission(familyId, userId);

    // 生成 6 位邀请码
    const inviteCode = this.generateInviteCode();

    // 计算过期时间
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const invitation = await this.prisma.familyInvitation.create({
      data: {
        familyId,
        inviteCode,
        createdBy: userId,
        expiresAt,
        maxUses,
      },
      include: {
        family: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return invitation;
  }

  /**
   * 使用邀请码加入家庭
   */
  async joinFamily(inviteCode: string, userId: string) {
    // 查找邀请码
    const invitation = await this.prisma.familyInvitation.findUnique({
      where: { inviteCode },
      include: {
        family: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invalid invite code');
    }

    // 检查是否过期
    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Invite code has expired');
    }

    // 检查使用次数
    if (invitation.maxUses !== -1 && invitation.usedCount >= invitation.maxUses) {
      throw new BadRequestException('Invite code has reached maximum uses');
    }

    // 检查是否已经是成员
    const existingMember = await this.prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId: invitation.familyId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('You are already a member of this family');
    }

    // 创建成员记录
    const member = await this.prisma.familyMember.create({
      data: {
        familyId: invitation.familyId,
        userId,
        role: FamilyMemberRole.ADMIN,
      },
      include: {
        family: true,
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    });

    // 记录使用
    await this.prisma.invitationUsage.create({
      data: {
        invitationId: invitation.id,
        userId,
      },
    });

    // 更新使用次数
    await this.prisma.familyInvitation.update({
      where: { id: invitation.id },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });

    return {
      family: member.family,
      role: member.role,
    };
  }

  /**
   * 获取家庭的邀请码列表
   */
  async getInvitations(familyId: string, userId: string) {
    // 检查是否是主人
    await this.checkOwnerPermission(familyId, userId);

    const invitations = await this.prisma.familyInvitation.findMany({
      where: { familyId },
      include: {
        usages: {
          include: {
            invitation: false,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invitations;
  }

  /**
   * 移除家庭成员
   */
  async removeMember(familyId: string, memberId: string, userId: string) {
    // 检查是否是主人
    await this.checkOwnerPermission(familyId, userId);

    // 不能移除主人自己
    const family = await this.prisma.family.findUnique({
      where: { id: familyId },
    });

    if (!family) {
      throw new NotFoundException('Family not found');
    }

    if (family.ownerId === memberId) {
      throw new BadRequestException('Cannot remove the owner');
    }

    await this.prisma.familyMember.delete({
      where: {
        familyId_userId: {
          familyId,
          userId: memberId,
        },
      },
    });

    return { message: 'Member removed successfully' };
  }

  /**
   * 检查主人权限
   */
  async checkOwnerPermission(familyId: string, userId: string) {
    const family = await this.prisma.family.findUnique({
      where: { id: familyId },
      select: { ownerId: true },
    });

    if (!family) {
      throw new NotFoundException(`Family with ID ${familyId} not found`);
    }

    if (family.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can perform this action');
    }

    return family;
  }

  /**
   * 检查管理员权限（主人或管理员）
   */
  async checkAdminPermission(familyId: string, userId: string) {
    const member = await this.prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this family');
    }

    if (member.role !== FamilyMemberRole.OWNER && member.role !== FamilyMemberRole.ADMIN) {
      throw new ForbiddenException('Only admins can perform this action');
    }

    return member;
  }

  /**
   * 检查成员权限
   */
  async checkMemberPermission(familyId: string, userId: string) {
    const member = await this.prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this family');
    }

    return member;
  }

  /**
   * 生成邀请码
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

