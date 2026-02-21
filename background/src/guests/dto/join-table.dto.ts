import { IsString, IsOptional } from 'class-validator';

export class JoinTableDto {
  @IsString()
  sessionId: string;

  @IsString()
  @IsOptional()
  name?: string;  // 已登录用户可选，后端用 user.nickname

  @IsString()
  @IsOptional()
  preferences?: string;
}
