import { Module } from "@nestjs/common";
import { DocumentService } from "./document.service";
import { LogSchedulerService } from "./log-scheduler.service";
import { UserLogSchedulerService } from "./user-log-scheduler.service";
import { UserModule } from "../user/user.module";
import { DocumentController } from "./document.controller";

@Module({
  imports: [UserModule],
  controllers: [DocumentController],
  providers: [DocumentService, UserLogSchedulerService, LogSchedulerService],
  exports: [DocumentService],
})
export class DocumentModule {}
