import { IsArray, IsString, IsNotEmpty } from 'class-validator';

export class UpdateCandidatesDto {
  @IsArray()
  @IsString({ each: true })
  dishIds: string[];

  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
