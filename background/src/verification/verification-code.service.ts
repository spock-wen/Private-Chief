import { Injectable } from '@nestjs/common';

/** 验证码存储项 */
interface CodeEntry {
  code: string;
  expiresAt: number;
}

/** 验证码有效期（毫秒），5 分钟 */
const CODE_TTL_MS = 5 * 60 * 1000;

/** 同一目标最短发送间隔（毫秒），60 秒 */
const SEND_INTERVAL_MS = 60 * 1000;

@Injectable()
export class VerificationCodeService {
  /** 内存存储：key 为 phone:xxx 或 email:xxx */
  private store = new Map<string, CodeEntry>();

  /** 上次发送时间：用于限流 */
  private lastSendAt = new Map<string, number>();

  /**
   * 生成 6 位数字验证码
   */
  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 存储验证码
   */
  set(target: string, type: 'phone' | 'email', code: string): void {
    const key = `${type}:${target}`;
    this.store.set(key, {
      code,
      expiresAt: Date.now() + CODE_TTL_MS,
    });
  }

  /**
   * 校验验证码（校验后不删除，允许重试几次）
   */
  verify(target: string, type: 'phone' | 'email', code: string): boolean {
    const key = `${type}:${target}`;
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return entry.code === code;
  }

  /**
   * 校验并删除验证码（验证成功后调用，防止重复使用）
   */
  verifyAndConsume(
    target: string,
    type: 'phone' | 'email',
    code: string,
  ): boolean {
    const valid = this.verify(target, type, code);
    if (valid) {
      this.store.delete(`${type}:${target}`);
    }
    return valid;
  }

  /**
   * 检查是否可以再次发送（60 秒内不能重复发送）
   */
  canSend(target: string, type: 'phone' | 'email'): boolean {
    const key = `${type}:${target}`;
    const last = this.lastSendAt.get(key);
    if (!last) return true;
    return Date.now() - last >= SEND_INTERVAL_MS;
  }

  /**
   * 记录发送时间
   */
  recordSend(target: string, type: 'phone' | 'email'): void {
    this.lastSendAt.set(`${type}:${target}`, Date.now());
  }

  /**
   * 获取剩余可发送秒数
   */
  getRemainingCooldownSeconds(
    target: string,
    type: 'phone' | 'email',
  ): number {
    const key = `${type}:${target}`;
    const last = this.lastSendAt.get(key);
    if (!last) return 0;
    const remaining = Math.ceil(
      (SEND_INTERVAL_MS - (Date.now() - last)) / 1000,
    );
    return Math.max(0, remaining);
  }
}
