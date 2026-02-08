import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Category } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createDishDto: CreateDishDto, @CurrentUser() user: any) {
    return this.dishesService.create(createDishDto, user.id);
  }

  @Get()
  @Public()
  findAll(
    @Query('familyId') familyId?: string,
    @Query('name') name?: string,
    @Query('category') category?: Category,
    @Query('tags') tags?: string,
  ) {
    const tagsArray = tags ? tags.split(',') : undefined;
    return this.dishesService.findAll(
      { familyId, name, category, tags: tagsArray },
      undefined, // userId 可选，如果需要权限验证可以传入
    );
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.dishesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateDishDto: UpdateDishDto,
    @CurrentUser() user: any,
  ) {
    return this.dishesService.update(id, updateDishDto, user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  putUpdate(
    @Param('id') id: string,
    @Body() updateDishDto: UpdateDishDto,
    @CurrentUser() user: any,
  ) {
    return this.dishesService.update(id, updateDishDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.dishesService.remove(id, user.id);
  }

  @Post('bulk-delete')
  @UseGuards(JwtAuthGuard)
  removeMany(@Body('ids') ids: string[], @CurrentUser() user: any) {
    return this.dishesService.removeMany(ids, user.id);
  }
}
