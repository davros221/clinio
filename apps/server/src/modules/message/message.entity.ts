import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { RoomEntity } from "../room/room.entity";
import { UserEntity } from "../user/user.entity";

@Entity("messages")
@Index("idx_message_roomId", ["roomId"])
@Index("idx_message_createdAt", ["createdAt"])
export class MessageEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  roomId!: string;

  @ManyToOne(() => RoomEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "roomId" })
  room!: RoomEntity;

  @Column({ type: "varchar" })
  senderId!: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "senderId" })
  sender!: UserEntity;

  @Column({ type: "text" })
  text!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
