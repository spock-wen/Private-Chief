import { IsEnum, IsString, IsOptional } from 'class-validator';
import { TableStatus } from '@prisma/client';

export class UpdateTableStatusDto {
  @IsEnum(TableStatus)
  status: TableStatus;

  @IsString()
  @IsOptional()  // 改为可选，因为后端使用 JWT 认证
  sessionId?: string;
}
