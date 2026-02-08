import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateInvitationDto {
  @IsString()
  familyId: string;

  @IsInt()
  @IsOptional()
  @Min(-1)
  maxUses?: number; // -1 表示无限制，默认 1

  @IsInt()
  @IsOptional()
  @Min(1)
  expiresInDays?: number; // 过期天数，默认 7 天
}

