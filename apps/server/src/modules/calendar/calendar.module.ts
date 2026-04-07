import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CalendarController } from "./calendar.controller";
import { CalendarService } from "./calendar.service";
import { AppointmentModule } from "../appointment/appointment.module";
import { PatientEntity } from "../patient/patient.entity";
import { OfficeEntity } from "../office/office.entity";
import { SettingsService } from "../../common/services/settings.service";

@Module({
  imports: [
    AppointmentModule,
    TypeOrmModule.forFeature([PatientEntity, OfficeEntity]),
  ],
  controllers: [CalendarController],
  providers: [CalendarService, SettingsService],
})
export class CalendarModule {}
