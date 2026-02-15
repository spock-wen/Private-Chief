import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: '昵称不能为空' })
  @MaxLength(50, { message: '昵称最多50字符' })
  nickname?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
