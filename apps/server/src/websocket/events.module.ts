import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EventsGateway } from "./events.gateway";
import { WsJwtGuard } from "./ws-jwt.guard";
import { RoomModule } from "../modules/room/room.module";
import { MessageModule } from "../modules/message/message.module";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("jwt.secret"),
      }),
    }),
    RoomModule,
    MessageModule,
  ],
  providers: [EventsGateway, WsJwtGuard],
})
export class EventsModule {}
