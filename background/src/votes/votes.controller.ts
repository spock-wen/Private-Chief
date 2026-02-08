import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { VotesService } from './votes.service';
import { VoteDto } from './dto/vote.dto';
import { SessionGuard } from '../sessions/session.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('tables/:tableId/votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 每分钟最多10次投票
  @UseGuards(SessionGuard)
  @Post()
  vote(@Param('tableId') tableId: string, @Body() voteDto: VoteDto) {
    return this.votesService.vote(tableId, voteDto.sessionId, voteDto.dishId);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 每分钟最多10次取消投票
  @UseGuards(SessionGuard)
  @Delete(':dishId')
  unvote(
    @Param('tableId') tableId: string,
    @Param('dishId') dishId: string,
    @Body('sessionId') sessionId: string,
  ) {
    return this.votesService.unvote(tableId, sessionId, dishId);
  }

  @Public()
  @Get('heatmap')
  getHeatmap(@Param('tableId') tableId: string) {
    return this.votesService.getHeatmap(tableId);
  }
}
