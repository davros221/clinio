import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { UserRole } from "@clinio/shared";
import { OfficeEntity } from "../office/office.entity";

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
  role!: UserRole;

  @ManyToMany(() => OfficeEntity, (office) => office.staff)
  offices?: OfficeEntity[];
}
