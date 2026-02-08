import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { SessionsService } from './sessions.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('session')
export class SessionController {
  constructor(private sessionsService: SessionsService) {}

  @Public()
  @Get('init')
  async initSession(@Req() req: Request, @Res() res: Response) {
    // 会话已经由 SessionMiddleware 创建和处理
    // 这个端点主要是为了让前端可以通过调用它来获取会话ID

    // 检查请求中是否已有会话ID
    const sessionId = req.headers['x-session-id'] || (req as any).sessionId;

    if (!sessionId) {
      // 如果没有会话ID，创建一个
      const newSessionId = await this.sessionsService.createSession();
      res.setHeader('X-Session-ID', newSessionId);

      res.json({
        success: true,
        message: 'New session created',
        sessionId: newSessionId
      });
    } else {
      res.json({
        success: true,
        message: 'Session already exists',
        sessionId: sessionId
      });
    }
  }
}