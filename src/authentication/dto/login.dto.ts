import { Transform } from "class-transformer";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";
import { trimLowercaseString } from "@src/common/validation/string.transform";

export class LoginDto {
  @Transform(trimLowercaseString)
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
