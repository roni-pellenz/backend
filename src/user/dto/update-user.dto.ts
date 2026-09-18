import { Transform } from "class-transformer";
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { trimLowercaseString, trimString } from "@src/common/validation/string.transform";

export class UpdateUserDto {
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  surname?: string;

  @IsOptional()
  @Transform(trimLowercaseString)
  @IsEmail()
  @MaxLength(254)
  email?: string;
}
