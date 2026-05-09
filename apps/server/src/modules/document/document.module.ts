import { Module } from "@nestjs/common";
import { DocumentService } from "./document.service";
import { LogSchedulerService } from "./log-scheduler.service";
import { UserLogSchedulerService } from "./user-log-scheduler.service";
import { UserModule } from "../user/user.module";

@Module({
  imports: [UserModule],
  providers: [DocumentService, UserLogSchedulerService, LogSchedulerService],
  exports: [DocumentService],
})
export class DocumentModule {}
