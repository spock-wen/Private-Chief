import { Module } from '@nestjs/common';
import { FamiliesService } from './families.service';
import { FamiliesController } from './families.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [FamiliesController],
  providers: [FamiliesService, PrismaService],
  exports: [FamiliesService],
})
export class FamiliesModule {}

