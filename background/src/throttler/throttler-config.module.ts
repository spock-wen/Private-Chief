import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
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
  ],
  providers: [
    Reflector,
  ],
  exports: [
    ThrottlerModule,
  ],
})
export class ThrottlerConfigModule {}