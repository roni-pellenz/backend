import { Transform } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength
} from "class-validator";
import { trimString } from "@src/common/validation/string.transform";

export class CreateRecurringIncomeDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
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
