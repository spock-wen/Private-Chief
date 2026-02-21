import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PhoneLoginDto } from './dto/phone-login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerificationCodeService } from '../verification/verification-code.service';
import { SmsService } from '../verification/sms.service';
import { EmailService } from '../verification/email.service';
import { QrcodeService } from '../qrcode/qrcode.service';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private verificationCode: VerificationCodeService,
    private sms: SmsService,
    private email: EmailService,
    private qrcodeService: QrcodeService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, phone, password } = loginDto;

    const emailStr = typeof email === 'string' ? email.trim() : '';
    const phoneStr = typeof phone === 'string' ? phone.trim() : '';

    if (!emailStr && !phoneStr) {
      throw new BadRequestException('请提供邮箱或手机号');
    }

    const conditions: { email?: string; phone?: string }[] = [];
    if (emailStr) conditions.push({ email: emailStr });
    if (phoneStr) conditions.push({ phone: phoneStr });
    if (conditions.length === 0) {
      throw new BadRequestException('请提供有效的邮箱或手机号');
    }

    const user = await this.prisma.user.findFirst({
      where: { OR: conditions },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (!user.password) {
      throw new UnauthorizedException('该账号未设置密码，请使用其他登录方式');
    }

    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch {
      throw new UnauthorizedException('密码验证失败，请重试');
    }
    if (!isPasswordValid) {
      throw new UnauthorizedException('密码错误');
    }

    return this.generateTokens(user);
  }

  async phoneLogin(phoneLoginDto: PhoneLoginDto) {
    const { phone, code } = phoneLoginDto;

    if (
      !this.verificationCode.verifyAndConsume(phone, 'phone', code)
    ) {
      throw new UnauthorizedException('验证码错误或已过期');
    }

    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          nickname: `用户${phone.slice(-4)}`,
        },
      });
    }

    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto) {
    const { email, phone, password, nickname, avatar, emailCode } =
      registerDto;

    if (!email && !phone) {
      throw new BadRequestException('请提供邮箱或手机号');
    }

    if (email) {
      if (!emailCode) {
        throw new BadRequestException('请提供邮箱验证码');
      }
      if (
        !this.verificationCode.verifyAndConsume(email, 'email', emailCode)
      ) {
        throw new UnauthorizedException('邮箱验证码错误或已过期');
      }
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
        ].filter((condition) => Object.keys(condition).length > 0),
      },
    });

    if (existingUser) {
      throw new ConflictException('该邮箱或手机号已被注册');
    }

    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    const user = await this.prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        nickname,
        avatar,
      },
    });

    return this.generateTokens(user);
  }

  async wechatLoginWithCode(code: string) {
    const { openid } = await this.getWechatSession(code);
    
    return this.wechatLogin(openid);
  }

  async wechatLogin(openId: string, nickname?: string, avatar?: string) {
    let user = await this.prisma.user.findUnique({
      where: { wechatOpenId: openId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          wechatOpenId: openId,
          nickname: nickname || `微信用户${openId.slice(-4)}`,
          avatar,
        },
      });
    }

    return this.generateTokens(user);
  }

  private async getWechatSession(code: string) {
    const appId = process.env.WECHAT_MINIPROGRAM_APPID;
    const appSecret = process.env.WECHAT_MINIPROGRAM_SECRET;

    if (!appId || !appSecret) {
      throw new InternalServerErrorException('微信小程序配置未设置');
    }

    try {
      const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
        params: {
          appid: appId,
          secret: appSecret,
          js_code: code,
          grant_type: 'authorization_code',
        },
      });

      const { openid, session_key, errcode, errmsg } = response.data;

      if (errcode) {
        throw new BadRequestException(`微信登录失败: ${errmsg}`);
      }

      return { openid, session_key };
    } catch (error) {
      throw new InternalServerErrorException('微信登录请求失败');
    }
  }

  async refreshToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return this.generateTokens(user);
  }

  private generateTokens(user: any) {
    const payload = {
      userId: user.id,
      email: user.email,
      phone: user.phone,
    };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        wechatOpenId: user.wechatOpenId,
      },
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const data: { nickname?: string; avatar?: string } = {};
    if (dto.nickname !== undefined) data.nickname = dto.nickname;
    if (dto.avatar !== undefined) data.avatar = dto.avatar;

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        phone: true,
        nickname: true,
        avatar: true,
        wechatOpenId: true,
      },
    });
  }

  async sendPhoneCode(phone: string) {
    if (!phone || !/^1\d{10}$/.test(phone)) {
      throw new BadRequestException('请输入正确的手机号');
    }
    if (!this.verificationCode.canSend(phone, 'phone')) {
      const remaining = this.verificationCode.getRemainingCooldownSeconds(
        phone,
        'phone',
      );
      throw new BadRequestException(
        `请 ${remaining} 秒后再试`,
      );
    }

    const code = this.verificationCode.generateCode();
    this.verificationCode.set(phone, 'phone', code);
    this.verificationCode.recordSend(phone, 'phone');
    await this.sms.sendCode(phone, code);

    const isDev = process.env.ENABLE_REAL_SMS !== 'true';
    return {
      message: '验证码已发送',
      ...(isDev && { code, tip: '开发环境：验证码见控制台' }),
    };
  }

  async sendEmailCode(email: string) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('请输入正确的邮箱');
    }
    if (!this.verificationCode.canSend(email, 'email')) {
      const remaining = this.verificationCode.getRemainingCooldownSeconds(
        email,
        'email',
      );
      throw new BadRequestException(
        `请 ${remaining} 秒后再试`,
      );
    }

    const code = this.verificationCode.generateCode();
    this.verificationCode.set(email, 'email', code);
    this.verificationCode.recordSend(email, 'email');
    await this.email.sendCode(email, code);

    const isDev = process.env.ENABLE_REAL_EMAIL !== 'true';
    return {
      message: '验证码已发送',
      ...(isDev && { code, tip: '开发环境：验证码见控制台' }),
    };
  }

  async bindPhone(userId: string, phone: string, code: string) {
    if (!this.verificationCode.verifyAndConsume(phone, 'phone', code)) {
      throw new UnauthorizedException('验证码错误或已过期');
    }

    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new UnauthorizedException('用户不存在');
    }

    if (currentUser.phone) {
      throw new BadRequestException('您已绑定手机号，请先解绑');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('该手机号已被其他账号绑定');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { phone },
      select: {
        id: true,
        email: true,
        phone: true,
        nickname: true,
        avatar: true,
        wechatOpenId: true,
      },
    });

    return {
      message: '手机号绑定成功',
      user: updatedUser,
    };
  }

  async bindWechat(userId: string, code: string) {
    const { openid } = await this.getWechatSession(code);

    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new UnauthorizedException('用户不存在');
    }

    if (currentUser.wechatOpenId) {
      throw new BadRequestException('您已绑定微信，请先解绑');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { wechatOpenId: openid },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('该微信已被其他账号绑定');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { wechatOpenId: openid },
      select: {
        id: true,
        email: true,
        phone: true,
        nickname: true,
        avatar: true,
        wechatOpenId: true,
      },
    });

    return {
      message: '微信绑定成功',
      user: updatedUser,
    };
  }

  async bindWechatByToken(bindToken: string, code: string) {
    const userId = this.qrcodeService.consumeBindToken(bindToken);
    if (!userId) {
      throw new BadRequestException('绑定链接已过期或无效');
    }

    return this.bindWechat(userId, code);
  }

  async unbindPhone(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (!user.phone) {
      throw new BadRequestException('您未绑定手机号');
    }

    if (!user.wechatOpenId && !user.email) {
      throw new BadRequestException('解绑后您将无法登录，请先绑定其他登录方式');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { phone: null },
      select: {
        id: true,
        email: true,
        phone: true,
        nickname: true,
        avatar: true,
        wechatOpenId: true,
      },
    });

    return {
      message: '手机号解绑成功',
      user: updatedUser,
    };
  }

  async unbindWechat(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (!user.wechatOpenId) {
      throw new BadRequestException('您未绑定微信');
    }

    if (!user.phone && !user.email) {
      throw new BadRequestException('解绑后您将无法登录，请先绑定其他登录方式');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { wechatOpenId: null },
      select: {
        id: true,
        email: true,
        phone: true,
        nickname: true,
        avatar: true,
        wechatOpenId: true,
      },
    });

    return {
      message: '微信解绑成功',
      user: updatedUser,
    };
  }
}
