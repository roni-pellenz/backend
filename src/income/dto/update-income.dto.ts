import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min
} from "class-validator";

export class UpdateIncomeDto {
  @IsOptional()
  @IsString()
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
  expectedDate?: string;
}
