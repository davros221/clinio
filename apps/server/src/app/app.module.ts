import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { ConfigModule } from "../config/config.module";
import { CalendarModule, OfficeModule, UserModule } from "../modules";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    UserModule,
    AuthModule,
    CalendarModule,
    OfficeModule,
  ],
})
export class AppModule {}
