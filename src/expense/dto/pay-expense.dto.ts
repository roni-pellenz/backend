import { IsDateString, IsInt, IsOptional, Min } from "class-validator";

export class PayExpenseDto {
  @IsDateString({ strict: true })
  paidDate!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  paidAmount?: number;
}
