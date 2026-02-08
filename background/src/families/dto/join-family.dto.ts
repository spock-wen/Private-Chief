import { IsString } from 'class-validator';

export class JoinFamilyDto {
  @IsString()
  inviteCode: string;
}

