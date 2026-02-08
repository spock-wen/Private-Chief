import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { SessionsService } from './sessions.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private sessionsService: SessionsService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 获取 session ID，可以从 headers 或 body 中获取
    const sessionId =
      request.headers['x-session-id'] ||
      request.body.sessionId ||
      request.query.sessionId;

    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }

    // 验证 session 是否存在
    const session = await this.sessionsService.getSession(sessionId);
    if (!session) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // 将 session 数据附加到请求对象上供后续处理使用
    request.session = session;
    request.sessionId = sessionId;

    return true;
  }
}