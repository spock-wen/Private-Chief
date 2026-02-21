import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { VotesService } from './votes.service';
import { VoteDto } from './dto/vote.dto';
import { SessionGuard } from '../sessions/session.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('tables/:tableId/votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(OptionalJwtAuthGuard, SessionGuard)
  @Post()
  vote(
    @Param('tableId') tableId: string,
    @Body() voteDto: VoteDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.votesService.vote(
      tableId,
      voteDto.sessionId,
      voteDto.dishId,
      userId,
    );
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(OptionalJwtAuthGuard, SessionGuard)
  @Delete(':dishId')
  unvote(
    @Param('tableId') tableId: string,
    @Param('dishId') dishId: string,
    @Body('sessionId') sessionId: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.votesService.unvote(tableId, sessionId, dishId, userId);
  }

  @Public()
  @Get('heatmap')
  getHeatmap(@Param('tableId') tableId: string) {
    return this.votesService.getHeatmap(tableId);
  }
}
