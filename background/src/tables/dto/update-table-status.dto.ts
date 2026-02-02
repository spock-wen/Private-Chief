import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { TableStatus } from '@prisma/client';

export class UpdateTableStatusDto {
  @IsEnum(TableStatus)
  status: TableStatus;

  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
