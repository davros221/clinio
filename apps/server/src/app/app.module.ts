import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { ConfigModule } from "../config/config.module";
import {
  CalendarModule,
  OfficeModule,
  UserModule,
  AppointmentModule,
  AddressModule,
  PatientModule,
  MedicalRecordModule,
  MailModule,
  RoomModule,
  MessageModule,
} from "../modules";
import { AuthModule } from "../auth/auth.module";
import { SystemModule } from "../system/system.module";
import { EventsModule } from "../websocket/events.module";

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    UserModule,
    AuthModule,
    CalendarModule,
    OfficeModule,
    AddressModule,
    AppointmentModule,
    PatientModule,
    MedicalRecordModule,
    MailModule,
    RoomModule,
    MessageModule,
    EventsModule,
    SystemModule,
  ],
})
export class AppModule {}
