import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { PrismaService } from '../prisma.service';
import { FamiliesModule } from '../families/families.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [FamiliesModule, SessionsModule],
  controllers: [TablesController],
  providers: [TablesService, PrismaService],
})
export class TablesModule {}
