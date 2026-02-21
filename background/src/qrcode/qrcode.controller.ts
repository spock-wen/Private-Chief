import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { QrcodeService } from './qrcode.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('qrcode')
export class QrcodeController {
  constructor(private readonly qrcodeService: QrcodeService) {}

  @Get('table/:tableId')
  @UseGuards(JwtAuthGuard)
  async getTableQrcode(@Param('tableId') tableId: string) {
    return this.qrcodeService.generateTableQrcode(tableId);
  }

  @Get('family/:familyId')
  @UseGuards(JwtAuthGuard)
  async getFamilyQrcode(@Param('familyId') familyId: string) {
    return this.qrcodeService.generateFamilyQrcode(familyId);
  }

  @Get('bind-wechat')
  @UseGuards(JwtAuthGuard)
  async getBindWechatQrcode(@CurrentUser() user: any) {
    return this.qrcodeService.generateBindWechatQrcode(user.id);
  }
}
