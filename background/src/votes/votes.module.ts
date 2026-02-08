import { Module } from '@nestjs/common';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { VotesGateway } from './votes.gateway';
import { PrismaService } from '../prisma.service';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [SessionsModule],
  controllers: [VotesController],
  providers: [VotesService, VotesGateway, PrismaService],
  exports: [VotesGateway],
})
export class VotesModule {}
