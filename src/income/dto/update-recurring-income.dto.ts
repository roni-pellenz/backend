import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class UpdateRecurringIncomeDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  amount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  receiptDay?: number;
}
