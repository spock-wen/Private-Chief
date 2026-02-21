import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GuestsService } from './guests.service';
import { JoinTableDto } from './dto/join-table.dto';
import { SessionGuard } from '../sessions/session.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('tables/:tableId/guests')
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(OptionalJwtAuthGuard, SessionGuard)
  @Post()
  join(
    @Param('tableId') tableId: string,
    @Body() joinTableDto: JoinTableDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.guestsService.joinTable(tableId, joinTableDto, userId);
  }

  @Public()
  @Get()
  findAll(@Param('tableId') tableId: string) {
    return this.guestsService.findByTable(tableId);
  }
}
