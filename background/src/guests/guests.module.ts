import { Module } from '@nestjs/common';
import { GuestsService } from './guests.service';
import { GuestsController } from './guests.controller';
import { PrismaService } from '../prisma.service';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [SessionsModule],
  controllers: [GuestsController],
  providers: [GuestsService, PrismaService],
})
export class GuestsModule {}
