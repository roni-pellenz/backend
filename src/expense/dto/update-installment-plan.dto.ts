import { Transform } from "class-transformer";
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength
} from "class-validator";
import { trimString } from "@src/common/validation/string.transform";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@src/expense/expense.constants";

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
  @IsIn(EXPENSE_CATEGORIES)
  category?: ExpenseCategory | null;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  notes?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(30)
  notificationDaysBefore?: number | null;

  @IsOptional()
  @IsDateString({ strict: true })
  purchaseDate?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  firstInstallmentDate?: string;
}
