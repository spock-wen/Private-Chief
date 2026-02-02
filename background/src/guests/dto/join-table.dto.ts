import { IsString, IsOptional } from 'class-validator';

export class JoinTableDto {
  @IsString()
  sessionId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  preferences?: string;
}
