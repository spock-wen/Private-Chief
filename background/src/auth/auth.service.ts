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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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

    // TODO: 验证验证码（这里暂时跳过，实际需要对接短信服务）
    // 临时：验证码为 123456
    if (code !== '123456') {
      throw new UnauthorizedException('验证码错误');
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
    const { email, phone, password, nickname, avatar } = registerDto;

    if (!email && !phone) {
      throw new BadRequestException('请提供邮箱或手机号');
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
    // TODO: 对接短信服务（如阿里云短信、腾讯云短信等）
    // 这里暂时只是模拟，固定验证码为 123456
    
    const code = '123456';
    console.log(`[开发环境] 发送验证码到 ${phone}: ${code}`);
    console.log(`[提示] 这是模拟的验证码服务，实际生产环境需要对接真实的短信服务`);
    
    return {
      message: '验证码已发送（开发环境模拟）',
      // 开发环境返回验证码供测试使用
      code: code,
      // 添加提示信息
      tip: '这是开发环境，验证码固定为 123456',
    };
  }
}

