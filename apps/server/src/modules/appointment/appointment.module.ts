import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppointmentController } from "./appointment.controller";
import { AppointmentService } from "./appointment.service";
import { AppointmentEntity } from "./appointment.entity";
import { PatientEntity } from "../patient/patient.entity";
import { OfficeEntity } from "../office/office.entity";
import { SettingsService } from "../../common/services/settings.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([AppointmentEntity, PatientEntity, OfficeEntity]),
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService, SettingsService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
