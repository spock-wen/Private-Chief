import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { VotesService } from './votes.service';
import { VoteDto } from './dto/vote.dto';

@Controller('tables/:tableId/votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  vote(@Param('tableId') tableId: string, @Body() voteDto: VoteDto) {
    return this.votesService.vote(tableId, voteDto.sessionId, voteDto.dishId);
  }

  @Delete(':dishId')
  unvote(
    @Param('tableId') tableId: string,
    @Param('dishId') dishId: string,
    @Body('sessionId') sessionId: string,
  ) {
    return this.votesService.unvote(tableId, sessionId, dishId);
  }

  @Get('heatmap')
  getHeatmap(@Param('tableId') tableId: string) {
    return this.votesService.getHeatmap(tableId);
  }
}
