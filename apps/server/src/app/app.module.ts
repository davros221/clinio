import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { ConfigModule } from "../config/config.module";
import {
  AddressModule,
  CalendarModule,
  OfficeModule,
  UserModule,
} from "../modules";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    UserModule,
    AuthModule,
    CalendarModule,
    OfficeModule,
    AddressModule,
  ],
})
export class AppModule {}
