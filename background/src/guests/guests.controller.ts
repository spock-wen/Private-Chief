import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { GuestsService } from './guests.service';
import { JoinTableDto } from './dto/join-table.dto';

@Controller('tables/:tableId/guests')
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Post()
  join(@Param('tableId') tableId: string, @Body() joinTableDto: JoinTableDto) {
    return this.guestsService.joinTable(tableId, joinTableDto);
  }

  @Get()
  findAll(@Param('tableId') tableId: string) {
    return this.guestsService.findByTable(tableId);
  }
}
