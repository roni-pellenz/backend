import { IsDateString, IsInt, IsString, MaxLength, Min } from "class-validator";

export class CreateInstallmentExpenseDto {
  @IsString()
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
