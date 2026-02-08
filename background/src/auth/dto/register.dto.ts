import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsString()
  nickname: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}

