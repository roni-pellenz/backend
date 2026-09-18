import { Module } from "@nestjs/common";
import { AuthenticationGuard } from "@src/authentication/authentication.guard";
import { DatabaseModule } from "@src/database/database.module";
import { IncomeController } from "@src/income/income.controller";
import { IncomeService } from "@src/income/income.service";
import { SessionModule } from "@src/session/session.module";

@Module({
  imports: [DatabaseModule, SessionModule],
  controllers: [IncomeController],
  providers: [IncomeService, AuthenticationGuard]
})
export class IncomeModule {}
