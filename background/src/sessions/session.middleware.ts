import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SessionsService } from './sessions.service';

export interface CustomRequest extends Request {
  sessionId?: string;
  session?: any;
}

@Injectable()
export class SessionMiddleware {
  constructor(private sessionsService: SessionsService) {}

  async use(req: CustomRequest, res: Response, next: NextFunction) {
    // 从 header、query 或 body 获取现有 session ID
    const sessionIdFromClient =
      req.headers['x-session-id'] ||
      req.body?.sessionId ||
      req.query.sessionId;

    let sessionId: string;

    if (sessionIdFromClient) {
      // 如果客户端提供了 session ID，验证它是否有效
      const existingSession = await this.sessionsService.getSession(sessionIdFromClient);
      if (existingSession) {
        // 使用现有的有效会话
        sessionId = sessionIdFromClient;
        req.sessionId = sessionId;
        req.session = existingSession;
      } else {
        // 如果客户端提供的 session ID 无效，则创建新的
        sessionId = await this.sessionsService.createSession();
        req.sessionId = sessionId;
      }
    } else {
      // 如果客户端没有提供 session ID，则创建新的
      sessionId = await this.sessionsService.createSession();
      req.sessionId = sessionId;
    }

    // 对于某些不需要认证的端点（如创建表），我们将 session ID 设置在响应头中
    // 以便前端可以获取并保存它
    res.setHeader('X-Session-ID', sessionId);

    next();
  }
}