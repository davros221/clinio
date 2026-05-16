import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("room_read_cursors")
export class RoomReadCursorEntity {
  @PrimaryColumn({ type: "uuid" })
  userId!: string;

  @PrimaryColumn({ type: "uuid" })
  roomId!: string;

  @Column({ type: "timestamptz" })
  lastReadAt!: Date;
}
