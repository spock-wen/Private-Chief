import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 可选的 JWT 认证守卫：有 token 时验证并附加 user，无 token 时放行不抛错
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    // 无论成功或失败都不抛错，有 user 则附加
    return user ?? null;
  }
}
