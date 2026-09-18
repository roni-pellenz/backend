import { Module, ValidationPipe } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuthenticationModule } from "@src/authentication/authentication.module";
import { RequestLoggingInterceptor } from "@src/common/logging/request-logging.interceptor";
import { ExpenseModule } from "@src/expense/expense.module";
import { IncomeModule } from "@src/income/income.module";
import { PlanningModule } from "@src/planning/planning.module";
import { SystemModule } from "@src/system/system.module";
import { UserModule } from "@src/user/user.module";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 60_000,
        limit: 120
      }
    ]),
    SystemModule,
    UserModule,
    AuthenticationModule,
    ExpenseModule,
    IncomeModule,
    PlanningModule
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true
      })
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor
    }
  ]
})
export class AppModule {}
