import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
import { UpdateCandidatesDto } from './dto/update-candidates.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { UpdateFinalSelectionDto } from './dto/update-final-selection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 每分钟最多创建5个餐桌
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createTableDto: CreateTableDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const sessionId = req.sessionId || req.headers['x-session-id'];
    return this.tablesService.create(createTableDto, user.id, sessionId);
  }

  @Public()
  @Get()
  findAll(
    @Query('familyId') familyId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.tablesService.findAll({ familyId, userId });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tablesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 每分钟最多20次状态更新
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateTableStatusDto: UpdateTableStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.tablesService.updateStatus(
      id,
      updateTableStatusDto.status,
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 每分钟最多30次候选菜品更新
  @Patch(':id/candidates')
  updateCandidates(
    @Param('id') id: string,
    @Body() updateCandidatesDto: UpdateCandidatesDto,
    @CurrentUser() user: any,
  ) {
    return this.tablesService.updateCandidates(
      id,
      updateCandidatesDto.dishIds,
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 每分钟最多30次最终菜品设置
  @Patch(':id/final')
  setFinalDishes(
    @Param('id') id: string,
    @Body() updateCandidatesDto: UpdateCandidatesDto,
    @CurrentUser() user: any,
  ) {
    return this.tablesService.setFinalDishes(
      id,
      updateCandidatesDto.dishIds,
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 每分钟最多30次最终选择设置
  @Patch(':id/final-selection')
  setFinalSelection(
    @Param('id') id: string,
    @Body() updateFinalSelectionDto: UpdateFinalSelectionDto,
    @CurrentUser() user: any,
  ) {
    return this.tablesService.setFinalSelection(
      id,
      updateFinalSelectionDto.dishIds,
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 每分钟最多20次账单更新
  @Patch(':id/billing')
  updateBilling(
    @Param('id') id: string,
    @Body() updateBillingDto: UpdateBillingDto,
    @CurrentUser() user: any,
  ) {
    return this.tablesService.updateBilling(
      id,
      updateBillingDto.totalExpense,
      user.id,
    );
  }
}
