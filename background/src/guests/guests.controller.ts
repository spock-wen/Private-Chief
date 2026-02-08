import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { GuestsService } from './guests.service';
import { JoinTableDto } from './dto/join-table.dto';
import { SessionGuard } from '../sessions/session.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('tables/:tableId/guests')
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 每分钟最多5次加入餐桌请求
  @UseGuards(SessionGuard)
  @Post()
  join(@Param('tableId') tableId: string, @Body() joinTableDto: JoinTableDto) {
    return this.guestsService.joinTable(tableId, joinTableDto);
  }

  @Public()
  @Get()
  findAll(@Param('tableId') tableId: string) {
    return this.guestsService.findByTable(tableId);
  }
}
