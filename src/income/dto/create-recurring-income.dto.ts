import { IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from "class-validator";

export class CreateRecurringIncomeDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsInt()
  @Min(1)
  amount!: number;

  @IsInt()
  @Min(1)
  @Max(31)
  receiptDay!: number;

  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  startCompetence!: string;

  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  endCompetence?: string;
}
