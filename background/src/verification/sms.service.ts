import { Injectable } from '@nestjs/common';

/** 是否启用真实短信（通过环境变量控制） */
const ENABLE_REAL_SMS = process.env.ENABLE_REAL_SMS === 'true';

@Injectable()
export class SmsService {
  /**
   * 发送短信验证码
   * 开发环境：不配置 ENABLE_REAL_SMS 时，仅打印日志
   * 生产环境：配置阿里云 AccessKey + 短信签名/模板后，真实发送
   * 参考：https://help.aliyun.com/document_detail/101414.html
   */
  async sendCode(phone: string, code: string): Promise<void> {
    if (!ENABLE_REAL_SMS) {
      console.log(`[SMS 模拟] 发送验证码到 ${phone}: ${code}`);
      return;
    }

    try {
      const dysms = await import('@alicloud/dysmsapi20170525');
      const core = await import('@alicloud/openapi-core');
      const Config = core.$OpenApiUtil.Config;
      const config = new Config({
        accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
        accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
        endpoint: 'dysmsapi.aliyuncs.com',
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Client = dysms.default as any;
      const client = new Client(config);
      const request = new dysms.SendSmsRequest({
        phoneNumbers: phone,
        signName: process.env.ALIYUN_SMS_SIGN_NAME || '',
        templateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE || '',
        templateParam: JSON.stringify({ code }),
      });
      await client.sendSms(request);
    } catch (err) {
      console.error('[SMS] 发送失败:', err);
      throw err;
    }
  }
}
