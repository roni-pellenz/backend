import { Module } from "@nestjs/common";
import { SystemController } from "@src/system/system.controller";

@Module({
  controllers: [SystemController]
})
export class SystemModule {}
