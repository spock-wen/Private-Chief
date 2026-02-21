import { Module } from '@nestjs/common';
import { GuestsService } from './guests.service';
import { GuestsController } from './guests.controller';
import { PrismaService } from '../prisma.service';
import { SessionsModule } from '../sessions/sessions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SessionsModule, AuthModule],
  controllers: [GuestsController],
  providers: [GuestsService, PrismaService],
})
export class GuestsModule {}
