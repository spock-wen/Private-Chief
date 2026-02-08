import { IsNumber, Min, IsString, IsOptional } from 'class-validator';

export class UpdateBillingDto {
  @IsNumber()
  @Min(0)
  totalExpense: number;

  @IsString()
  @IsOptional()  // 改为可选，因为后端使用 JWT 认证
  sessionId?: string;
}
