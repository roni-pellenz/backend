import { Module } from "@nestjs/common";
import { DatabaseModule } from "@src/database/database.module";
import { SystemController } from "@src/system/system.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [SystemController]
})
export class SystemModule {}
