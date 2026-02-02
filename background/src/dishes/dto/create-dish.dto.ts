import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { Category } from '@prisma/client';

export class CreateDishDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsEnum(Category)
  category: Category;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  allergens?: string;
}
