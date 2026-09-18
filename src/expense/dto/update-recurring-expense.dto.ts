import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class UpdateRecurringExpenseDto {
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
  dueDay?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  plannedPaymentDay?: number | null;
}
