import { Module } from "@nestjs/common";
import { AuthenticationGuard } from "@src/authentication/authentication.guard";
import { DatabaseModule } from "@src/database/database.module";
import { ExpenseController } from "@src/expense/expense.controller";
import { ExpenseService } from "@src/expense/expense.service";
import { SessionModule } from "@src/session/session.module";

@Module({
  imports: [DatabaseModule, SessionModule],
  controllers: [ExpenseController],
  providers: [ExpenseService, AuthenticationGuard]
})
export class ExpenseModule {}
