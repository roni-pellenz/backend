import { Transform } from "class-transformer";
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength
} from "class-validator";
import { trimString } from "@src/common/validation/string.transform";

export class UpdateInstallmentPlanDto {
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(2)
  installments?: number;

  @IsOptional()
  @IsDateString({ strict: true })
  purchaseDate?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  firstInstallmentDate?: string;
}
