import { IsDateString, IsInt, IsString, Matches, MaxLength, Min } from "class-validator";

export class CreateIncomeDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsInt()
  @Min(1)
  amount!: number;

  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  competence!: string;

  @IsDateString({ strict: true })
  expectedDate!: string;
}
