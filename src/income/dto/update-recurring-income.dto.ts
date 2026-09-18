import { Transform } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";
import { trimString } from "@src/common/validation/string.transform";

export class UpdateRecurringIncomeDto {
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
  @IsInt()
  @Min(1)
  @Max(31)
  receiptDay?: number;
}
