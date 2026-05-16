import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MessageEntity } from "./message.entity";
import { MessageService } from "./message.service";
import { MessageController } from "./message.controller";
import { RoomModule } from "../room/room.module";

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity]), RoomModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
