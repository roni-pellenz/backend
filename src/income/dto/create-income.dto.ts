import { Transform } from "class-transformer";
import { IsDateString, IsInt, IsString, Matches, MaxLength, Min, MinLength } from "class-validator";
import { trimString } from "@src/common/validation/string.transform";

export class CreateIncomeDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
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
