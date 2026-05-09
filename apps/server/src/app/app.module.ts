import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { WinstonModule } from "nest-winston";
import { ScheduleModule } from "@nestjs/schedule";
import * as winston from "winston";

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
} from "../modules";
import { AuthModule } from "../auth/auth.module";
import { AppController } from "./app.controller";
import { ExecutionLoggingInterceptor } from "../common/interceptors/execution-logging.interceptor";
import { DocumentModule } from "../modules/document/document.module";

@Module({
  controllers: [AppController],
  imports: [
    ScheduleModule.forRoot(),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.File({
          filename: "logs/backend-execution.log",
          level: "info",
          format: winston.format.combine(
            winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            winston.format.printf(({ timestamp, level, message }) => {
              return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
            })
          ),
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    }),
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
    DocumentModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ExecutionLoggingInterceptor,
    },
  ],
})
export class AppModule {}
