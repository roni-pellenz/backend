import { Transform } from "class-transformer";
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength
} from "class-validator";
import { trimString } from "@src/common/validation/string.transform";

export class UpdateExpenseDto {
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  amount?: number;

  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  competence?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  dueDate?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  plannedPaymentDate?: string | null;
}
