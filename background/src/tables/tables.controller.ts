import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
import { UpdateCandidatesDto } from './dto/update-candidates.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { UpdateFinalSelectionDto } from './dto/update-final-selection.dto';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  @Get()
  findAll(@Query('sessionId') sessionId?: string) {
    return this.tablesService.findAll(sessionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tablesService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateTableStatusDto: UpdateTableStatusDto,
  ) {
    return this.tablesService.updateStatus(
      id,
      updateTableStatusDto.status,
      updateTableStatusDto.sessionId,
    );
  }

  @Patch(':id/candidates')
  updateCandidates(
    @Param('id') id: string,
    @Body() updateCandidatesDto: UpdateCandidatesDto,
  ) {
    return this.tablesService.updateCandidates(
      id,
      updateCandidatesDto.dishIds,
      updateCandidatesDto.sessionId,
    );
  }

  @Patch(':id/final')
  setFinalDishes(
    @Param('id') id: string,
    @Body() updateCandidatesDto: UpdateCandidatesDto,
  ) {
    return this.tablesService.setFinalDishes(
      id,
      updateCandidatesDto.dishIds,
      updateCandidatesDto.sessionId,
    );
  }

  @Patch(':id/final-selection')
  setFinalSelection(
    @Param('id') id: string,
    @Body() updateFinalSelectionDto: UpdateFinalSelectionDto,
  ) {
    return this.tablesService.setFinalSelection(
      id,
      updateFinalSelectionDto.dishIds,
      updateFinalSelectionDto.sessionId,
    );
  }

  @Patch(':id/billing')
  updateBilling(
    @Param('id') id: string,
    @Body() updateBillingDto: UpdateBillingDto,
  ) {
    return this.tablesService.updateBilling(
      id,
      updateBillingDto.totalExpense,
      updateBillingDto.sessionId,
    );
  }
}
