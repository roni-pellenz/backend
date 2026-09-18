import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { Authentication } from "@src/authentication/authentication.decorator";
import { AuthenticationGuard } from "@src/authentication/authentication.guard";
import type { AuthenticationContext } from "@src/authentication/authentication.types";
import { GetMonthlyPlanningDto } from "@src/planning/dto/get-monthly-planning.dto";
import { GetPlanningProjectionDto } from "@src/planning/dto/get-planning-projection.dto";
import { PlanningService } from "@src/planning/planning.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiTags("planning")
@ApiBearerAuth()
@Controller("planning")
@UseGuards(AuthenticationGuard)
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  @Get()
  getMonthly(
    @Authentication()
    authentication: AuthenticationContext,
    @Query() query: GetMonthlyPlanningDto
  ) {
    return this.planningService.getMonthly(authentication.user.id, query.competence);
  }

  @Get("projection")
  getProjection(
    @Authentication()
    authentication: AuthenticationContext,
    @Query() query: GetPlanningProjectionDto
  ) {
    return this.planningService.getProjection(
      authentication.user.id,
      query.startCompetence,
      query.months ?? 12
    );
  }
}
