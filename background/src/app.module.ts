import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { FamiliesModule } from './families/families.module';
import { DishesModule } from './dishes/dishes.module';
import { TablesModule } from './tables/tables.module';
import { GuestsModule } from './guests/guests.module';
import { VotesModule } from './votes/votes.module';
import { SessionsModule } from './sessions/sessions.module';
import { SessionMiddleware } from './sessions/session.middleware';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerConfigModule } from './throttler/throttler-config.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SessionCleanupService } from './sessions/session-cleanup.service';
import { SessionController } from './sessions/session.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(), // 启用调度功能
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1秒
        limit: 3, // 最多3个请求
      },
      {
        name: 'long',
        ttl: 60000, // 1分钟
        limit: 100, // 最多100个请求
      },
    ]),
    AuthModule,
    FamiliesModule,
    DishesModule,
    TablesModule,
    GuestsModule,
    VotesModule,
    SessionsModule
  ],
  controllers: [
    AppController,
    SessionController, // 添加会话控制器
  ],
  providers: [
    AppService,
    PrismaService,
    SessionCleanupService, // 注册会话清理服务
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // 全局启用 JWT 认证
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}
