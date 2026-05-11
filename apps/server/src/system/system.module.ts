import { Module } from "@nestjs/common";
import { UserModule } from "../modules/user/user.module";
import { SystemController } from "./system.controller";
import { SystemService } from "./system.service";

@Module({
  imports: [UserModule],
  controllers: [SystemController],
  providers: [SystemService],
})
export class SystemModule {}
