import {
  Column,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { UserRole } from "@clinio/shared";
import { OfficeEntity } from "../office/office.entity";

@Entity("users")
@Unique(["email"])
@Index("idx_user_role", ["role"])
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  email!: string;

  @Column({ nullable: true, type: "varchar" })
  password?: string | null;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ type: "enum", enum: Object.values(UserRole) })
  role!: UserRole;

  @Column({ nullable: true })
  activationToken?: string;

  @Column({ nullable: true })
  activationTokenExpiresAt?: Date;

  @ManyToMany(() => OfficeEntity, (office) => office.staff)
  offices?: OfficeEntity[];
}
