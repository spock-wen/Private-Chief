import { Injectable, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import axios from 'axios';

interface BindTokenData {
  userId: string;
  createdAt: number;
}

const bindTokens = new Map<string, BindTokenData>();

@Injectable()
export class QrcodeService {
  private readonly logger = new Logger(QrcodeService.name);

  private async getAccessToken(): Promise<string> {
    const appId = process.env.WECHAT_MINIPROGRAM_APPID;
    const appSecret = process.env.WECHAT_MINIPROGRAM_SECRET;

    if (!appId || !appSecret || appSecret === '你的小程序AppSecret') {
      throw new InternalServerErrorException('微信小程序配置未设置，请在 .env 文件中配置 WECHAT_MINIPROGRAM_APPID 和 WECHAT_MINIPROGRAM_SECRET');
    }

    try {
      const response = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
        params: {
          grant_type: 'client_credential',
          appid: appId,
          secret: appSecret,
        },
      });

      const { access_token, errcode, errmsg } = response.data;

      if (errcode) {
        this.logger.error(`获取 access_token 失败: ${errcode} - ${errmsg}`);
        throw new InternalServerErrorException(`获取 access_token 失败: ${errmsg}`);
      }

      return access_token;
    } catch (error) {
      this.logger.error('获取 access_token 请求失败', error);
      throw new InternalServerErrorException('获取 access_token 请求失败');
    }
  }

  async generateTableQrcode(tableId: string) {
    const accessToken = await this.getAccessToken();
    const scene = `t=${tableId}`;
    const page = 'pages/table/detail';

    return this.generateQrcode(accessToken, scene, page);
  }

  async generateFamilyQrcode(familyId: string) {
    const accessToken = await this.getAccessToken();
    const scene = `f=${familyId}`;
    const page = 'pages/family/join';

    return this.generateQrcode(accessToken, scene, page);
  }

  async generateBindWechatQrcode(userId: string) {
    const accessToken = await this.getAccessToken();
    
    const bindToken = this.generateBindToken();
    bindTokens.set(bindToken, { userId, createdAt: Date.now() });
    
    const scene = `b=${bindToken}`;
    const page = 'pages/index/index';

    return this.generateQrcode(accessToken, scene, page);
  }

  private generateBindToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 16; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  validateBindToken(bindToken: string): string | null {
    const data = bindTokens.get(bindToken);
    if (!data) {
      return null;
    }

    if (Date.now() - data.createdAt > 5 * 60 * 1000) {
      bindTokens.delete(bindToken);
      return null;
    }

    return data.userId;
  }

  consumeBindToken(bindToken: string): string | null {
    const userId = this.validateBindToken(bindToken);
    if (userId) {
      bindTokens.delete(bindToken);
    }
    return userId;
  }

  private async generateQrcode(accessToken: string, scene: string, page: string) {
    try {
      this.logger.log(`生成小程序码: page=${page}, scene=${scene}`);
      
      const response = await axios.post(
        `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`,
        {
          scene,
          page,
          is_hyaline: false,
          width: 430,
        },
        {
          responseType: 'arraybuffer',
        }
      );

      const contentType = response.headers['content-type'];
      if (contentType?.includes('application/json')) {
        const errorText = response.data.toString('utf8');
        const error = JSON.parse(errorText);
        this.logger.error(`生成小程序码失败: ${JSON.stringify(error)}`);
        throw new InternalServerErrorException(`生成小程序码失败: ${error.errmsg || '未知错误'}`);
      }

      const base64 = Buffer.from(response.data).toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;

      return { url: dataUrl };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('生成小程序码请求失败', error);
      throw new InternalServerErrorException('生成小程序码请求失败');
    }
  }
}
