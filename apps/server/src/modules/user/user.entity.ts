import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";
import { type TUserRole, UserRole } from "@clinio/shared";

@Entity("users")
@Unique(["email"])
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ type: "enum", enum: Object.values(UserRole) })
  role!: TUserRole;
}
