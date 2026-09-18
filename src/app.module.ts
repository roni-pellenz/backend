import { Module, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { SystemModule } from "@src/system/system.module";
import { UserModule } from "@src/user/user.module";

@Module({
  imports: [SystemModule, UserModule],
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
