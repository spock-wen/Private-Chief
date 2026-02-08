import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FamiliesService } from './families.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { JoinFamilyDto } from './dto/join-family.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('families')
@UseGuards(JwtAuthGuard)
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  /**
   * 创建家庭
   */
  @Post()
  create(@Body() createFamilyDto: CreateFamilyDto, @CurrentUser() user: any) {
    return this.familiesService.create(createFamilyDto, user.id);
  }

  /**
   * 获取我的家庭列表
   */
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.familiesService.findAllByUser(user.id);
  }

  /**
   * 获取家庭详情
   */
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.familiesService.findOne(id, user.id);
  }

  /**
   * 更新家庭信息
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFamilyDto: UpdateFamilyDto,
    @CurrentUser() user: any,
  ) {
    return this.familiesService.update(id, updateFamilyDto, user.id);
  }

  /**
   * 删除家庭
   */
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.familiesService.remove(id, user.id);
  }

  /**
   * 生成邀请码
   */
  @Post('invitations')
  createInvitation(
    @Body() createInvitationDto: CreateInvitationDto,
    @CurrentUser() user: any,
  ) {
    return this.familiesService.createInvitation(createInvitationDto, user.id);
  }

  /**
   * 获取家庭的邀请码列表
   */
  @Get(':id/invitations')
  getInvitations(@Param('id') id: string, @CurrentUser() user: any) {
    return this.familiesService.getInvitations(id, user.id);
  }

  /**
   * 使用邀请码加入家庭
   */
  @Post('join')
  joinFamily(@Body() joinFamilyDto: JoinFamilyDto, @CurrentUser() user: any) {
    return this.familiesService.joinFamily(joinFamilyDto.inviteCode, user.id);
  }

  /**
   * 移除家庭成员
   */
  @Delete(':familyId/members/:memberId')
  removeMember(
    @Param('familyId') familyId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: any,
  ) {
    return this.familiesService.removeMember(familyId, memberId, user.id);
  }
}

