import { IsNumber, Min, IsString, IsNotEmpty } from 'class-validator';

export class UpdateBillingDto {
  @IsNumber()
  @Min(0)
  totalExpense: number;

  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
