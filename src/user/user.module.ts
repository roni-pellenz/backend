import { Module } from "@nestjs/common";
import { AuthenticationGuard } from "@src/authentication/authentication.guard";
import { DatabaseModule } from "@src/database/database.module";
import { SessionModule } from "@src/session/session.module";
import { UserController } from "@src/user/user.controller";
import { UserService } from "@src/user/user.service";

@Module({
  imports: [DatabaseModule, SessionModule],
  controllers: [UserController],
  providers: [UserService, AuthenticationGuard]
})
export class UserModule {}
