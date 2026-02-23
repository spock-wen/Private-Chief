import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PhoneLoginDto } from './dto/phone-login.dto';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { BindPhoneDto, BindWechatDto, BindWechatByTokenDto } from './dto/bind-account.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('login/phone')
  async phoneLogin(@Body() phoneLoginDto: PhoneLoginDto) {
    return this.authService.phoneLogin(phoneLoginDto);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('wechat')
  async wechatLogin(@Body() dto: WechatLoginDto) {
    return this.authService.wechatLoginWithCode(dto.code);
  }

  @Public()
  @Post('login/wechat')
  async wechatLoginLegacy(
    @Body('openId') openId: string,
    @Body('nickname') nickname?: string,
    @Body('avatar') avatar?: string,
  ) {
    return this.authService.wechatLogin(openId, nickname, avatar);
  }

  @Public()
  @Post('send-code')
  async sendCode(@Body('phone') phone: string) {
    return this.authService.sendPhoneCode(phone);
  }

  @Public()
  @Post('send-email-code')
  async sendEmailCode(@Body('email') email: string) {
    return this.authService.sendEmailCode(email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@CurrentUser() user: any) {
    return this.authService.refreshToken(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('bind-phone')
  async bindPhone(@CurrentUser() user: any, @Body() dto: BindPhoneDto) {
    return this.authService.bindPhone(user.id, dto.phone, dto.code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('bind-wechat')
  async bindWechat(@CurrentUser() user: any, @Body() dto: BindWechatDto) {
    return this.authService.bindWechat(user.id, dto.code);
  }

  @Public()
  @Post('bind-wechat-by-token')
  async bindWechatByToken(@Body() dto: BindWechatByTokenDto) {
    return this.authService.bindWechatByToken(dto.bindToken, dto.code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unbind-phone')
  async unbindPhone(@CurrentUser() user: any) {
    return this.authService.unbindPhone(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unbind-wechat')
  async unbindWechat(@CurrentUser() user: any) {
    return this.authService.unbindWechat(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bind-info')
  async getBindInfo(@CurrentUser() user: any) {
    return {
      phone: user.phone,
      wechatOpenId: user.wechatOpenId ? true : false,
      email: user.email
    };
  }
}
