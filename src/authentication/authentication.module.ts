import { Module } from "@nestjs/common";
import { AuthenticationController } from "@src/authentication/authentication.controller";
import { AuthenticationGuard } from "@src/authentication/authentication.guard";
import { AuthenticationService } from "@src/authentication/authentication.service";
import { DatabaseModule } from "@src/database/database.module";
import { SessionModule } from "@src/session/session.module";

@Module({
  imports: [DatabaseModule, SessionModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, AuthenticationGuard]
})
export class AuthenticationModule {}
