import { Matches } from "class-validator";

export class ListIncomesDto {
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  competence!: string;
}
