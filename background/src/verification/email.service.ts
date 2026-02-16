import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/** 是否启用真实邮件（通过环境变量控制） */
const ENABLE_REAL_EMAIL = process.env.ENABLE_REAL_EMAIL === 'true';

@Injectable()
export class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    if (ENABLE_REAL_EMAIL && process.env.EMAIL_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '465', 10),
        secure: process.env.EMAIL_SECURE !== 'false',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }
  }

  /**
   * 发送邮箱验证码
   * 开发环境：不配置 ENABLE_REAL_EMAIL 时，仅打印日志
   * 生产环境：配置 SMTP 后真实发送
   */
  async sendCode(email: string, code: string): Promise<void> {
    if (!ENABLE_REAL_EMAIL || !this.transporter) {
      console.log(`[Email 模拟] 发送验证码到 ${email}: ${code}`);
      return;
    }

    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const appName = process.env.APP_NAME || 'SpockChef 私厨';

    await this.transporter.sendMail({
      from: `"${appName}" <${from}>`,
      to: email,
      subject: `【${appName}】验证码`,
      html: `
        <p>您好，</p>
        <p>您的验证码是：<strong style="font-size:24px;letter-spacing:4px;">${code}</strong></p>
        <p>验证码 5 分钟内有效，请勿泄露给他人。</p>
        <p>如非本人操作，请忽略此邮件。</p>
      `,
    });
  }
}
