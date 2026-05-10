import {
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "../user/user.entity";

@Entity("rooms")
export class RoomEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToMany(() => UserEntity)
  @JoinTable({
    name: "room_participants",
    joinColumn: { name: "roomId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "userId", referencedColumnName: "id" },
  })
  participants!: UserEntity[];

  @CreateDateColumn()
  createdAt!: Date;
}
