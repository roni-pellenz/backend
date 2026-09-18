import { Transform } from "class-transformer";
import { IsDateString, IsInt, IsString, MaxLength, Min, MinLength } from "class-validator";
import { trimString } from "@src/common/validation/string.transform";

export class CreateInstallmentExpenseDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name!: string;

  @IsInt()
  @Min(1)
  totalAmount!: number;

  @IsInt()
  @Min(2)
  installments!: number;

  @IsDateString({ strict: true })
  purchaseDate!: string;

  @IsDateString({ strict: true })
  firstInstallmentDate!: string;
}
