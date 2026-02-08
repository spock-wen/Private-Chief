import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PhoneLoginDto } from './dto/phone-login.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 邮箱/手机号 + 密码登录
   */
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * 手机号 + 验证码登录
   */
  @Public()
  @Post('login/phone')
  async phoneLogin(@Body() phoneLoginDto: PhoneLoginDto) {
    return this.authService.phoneLogin(phoneLoginDto);
  }

  /**
   * 注册
   */
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * 微信登录
   */
  @Public()
  @Post('login/wechat')
  async wechatLogin(
    @Body('openId') openId: string,
    @Body('nickname') nickname?: string,
    @Body('avatar') avatar?: string,
  ) {
    return this.authService.wechatLogin(openId, nickname, avatar);
  }

  /**
   * 发送手机验证码
   */
  @Public()
  @Post('send-code')
  async sendCode(@Body('phone') phone: string) {
    return this.authService.sendPhoneCode(phone);
  }

  /**
   * 刷新 Token
   */
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@CurrentUser() user: any) {
    return this.authService.refreshToken(user.id);
  }

  /**
   * 获取当前用户信息
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    return user;
  }
}

