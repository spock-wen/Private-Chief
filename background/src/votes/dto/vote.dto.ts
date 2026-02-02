import { IsString } from 'class-validator';

export class VoteDto {
  @IsString()
  sessionId: string;

  @IsString()
  dishId: string;
}
