import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class BindPhoneDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export class BindWechatDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class BindWechatByTokenDto {
  @IsString()
  @IsNotEmpty()
  bindToken: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
