import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private verificationCode: VerificationCodeService,
    private sms: SmsService,
    private email: EmailService,
  ) {}

  /**
   * 邮箱/手机号 + 密码登录
   */
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

  /**
   * 手机号 + 验证码登录（自动注册）
   */
  async phoneLogin(phoneLoginDto: PhoneLoginDto) {
    const { phone, code } = phoneLoginDto;

    if (
      !this.verificationCode.verifyAndConsume(phone, 'phone', code)
    ) {
      throw new UnauthorizedException('验证码错误或已过期');
    }

    // 查找或创建用户
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      // 自动注册
      user = await this.prisma.user.create({
        data: {
          phone,
          nickname: `用户${phone.slice(-4)}`, // 默认昵称
        },
      });
    }

    return this.generateTokens(user);
  }

  /**
   * 邮箱注册
   */
  async register(registerDto: RegisterDto) {
    const { email, phone, password, nickname, avatar, emailCode } =
      registerDto;

    if (!email && !phone) {
      throw new BadRequestException('请提供邮箱或手机号');
    }

    // 邮箱注册需校验验证码
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

    // 检查是否已存在
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

    // 加密密码
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    // 创建用户
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

  /**
   * 微信登录（OpenID）
   */
  async wechatLogin(openId: string, nickname?: string, avatar?: string) {
    // 查找或创建用户
    let user = await this.prisma.user.findUnique({
      where: { wechatOpenId: openId },
    });

    if (!user) {
      // 自动注册
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

  /**
   * 刷新 Token
   */
  async refreshToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return this.generateTokens(user);
  }

  /**
   * 生成 JWT Token
   */
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

  /**
   * 更新个人信息
   */
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

  /**
   * 发送验证码（手机号）
   */
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

  /**
   * 发送验证码（邮箱）
   */
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
}

