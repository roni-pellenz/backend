import { Module, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { SystemModule } from "@src/system/system.module";
import { UserModule } from "@src/user/user.module";
import { AuthenticationModule } from "@src/authentication/authentication.module";
import { ExpenseModule } from "@src/expense/expense.module";

@Module({
  imports: [SystemModule, UserModule, AuthenticationModule, ExpenseModule],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true
      })
    }
  ]
})
export class AppModule {}
