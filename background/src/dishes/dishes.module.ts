import { Module } from '@nestjs/common';
import { DishesService } from './dishes.service';
import { DishesController } from './dishes.controller';
import { PrismaService } from '../prisma.service';
import { FamiliesModule } from '../families/families.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [FamiliesModule, SessionsModule],
  controllers: [DishesController],
  providers: [DishesService, PrismaService],
})
export class DishesModule {}
