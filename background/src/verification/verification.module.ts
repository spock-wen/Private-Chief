import { Module } from '@nestjs/common';
import { VerificationCodeService } from './verification-code.service';
import { SmsService } from './sms.service';
import { EmailService } from './email.service';

@Module({
  providers: [VerificationCodeService, SmsService, EmailService],
  exports: [VerificationCodeService, SmsService, EmailService],
})
export class VerificationModule {}
