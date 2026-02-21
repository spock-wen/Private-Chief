import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateTableDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  time: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  addressDetail?: string;

  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsString()
  @IsNotEmpty()
  familyId: string; // 所属家庭ID

  @IsString()
  @IsNotEmpty()
  hostName: string; // 主人昵称（用于创建 Guest 记录）
}
