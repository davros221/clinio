import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoomEntity } from "./room.entity";
import { RoomReadCursorEntity } from "./room-read-cursor.entity";
import { RoomService } from "./room.service";
import { RoomController } from "./room.controller";

@Module({
  imports: [TypeOrmModule.forFeature([RoomEntity, RoomReadCursorEntity])],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}
