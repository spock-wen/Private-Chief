import { IsString } from 'class-validator';

export class PhoneLoginDto {
  @IsString()
  phone: string;

  @IsString()
  code: string; // 验证码
}

