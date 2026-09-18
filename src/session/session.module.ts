import { Module } from "@nestjs/common";
import { DatabaseModule } from "@src/database/database.module";
import { SessionService } from "@src/session/session.service";

@Module({
  imports: [DatabaseModule],
  providers: [SessionService],
  exports: [SessionService]
})
export class SessionModule {}
