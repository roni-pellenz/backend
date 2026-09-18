import { IsDateString } from "class-validator";

export class ReceiveIncomeDto {
  @IsDateString({ strict: true })
  receivedDate!: string;
}
