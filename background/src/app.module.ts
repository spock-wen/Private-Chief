import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { DishesModule } from './dishes/dishes.module';
import { TablesModule } from './tables/tables.module';
import { GuestsModule } from './guests/guests.module';
import { VotesModule } from './votes/votes.module';

@Module({
  imports: [DishesModule, TablesModule, GuestsModule, VotesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
