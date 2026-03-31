import { Module } from "@nestjs/common";
import { CalendarController } from "./calendar.controller";
import { CalendarService } from "./calendar.service";
import { AppointmentModule } from "../appointment/appointment.module";

@Module({
  imports: [AppointmentModule],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
