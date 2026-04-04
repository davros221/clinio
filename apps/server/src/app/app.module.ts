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
} from "../modules";
import { AuthModule } from "../auth/auth.module";
import { AppController } from "./app.controller";

@Module({
  controllers: [AppController],
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
  ],
})
export class AppModule {}
