import { Type } from "class-transformer";
import { IsInt, IsOptional, Matches, Max, Min } from "class-validator";

export class GetPlanningProjectionDto {
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  startCompetence!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  months?: number;
}
