import { Module } from "@nestjs/common";
import { AuthenticationGuard } from "@src/authentication/authentication.guard";
import { ExpenseModule } from "@src/expense/expense.module";
import { IncomeModule } from "@src/income/income.module";
import { PlanningController } from "@src/planning/planning.controller";
import { PlanningService } from "@src/planning/planning.service";
import { SessionModule } from "@src/session/session.module";

@Module({
  imports: [ExpenseModule, IncomeModule, SessionModule],
  controllers: [PlanningController],
  providers: [PlanningService, AuthenticationGuard]
})
export class PlanningModule {}
