import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionsService } from './sessions.service';

@Injectable()
export class SessionCleanupService {
  private readonly logger = Logger;

  constructor(private sessionsService: SessionsService) {}

  @Cron(CronExpression.EVERY_HOUR) // 每小时执行一次清理
  async handleCron() {
    this.logger.log('Cleaning up expired sessions...');
    await this.sessionsService.cleanupExpiredSessions();
    this.logger.log('Expired sessions cleaned up successfully.');
  }
}