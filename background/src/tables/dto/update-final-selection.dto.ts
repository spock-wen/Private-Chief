import { IsArray, IsString, IsOptional } from 'class-validator';

export class UpdateFinalSelectionDto {
  @IsArray()
  @IsString({ each: true })
  dishIds: string[];

  @IsString()
  @IsOptional()  // 改为可选，因为后端使用 JWT 认证
  sessionId?: string;
}
