import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OfficeHoursTemplate } from "@clinio/shared";
import { UserEntity } from "../user/user.entity";

@Entity("offices")
@Index("idx_office_name", ["name"])
@Index("idx_office_specialization", ["specialization"])
export class OfficeEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  address!: string;

  @Column()
  specialization!: string;

  @Column({ type: "jsonb", nullable: true })
  officeHoursTemplate!: OfficeHoursTemplate | null;

  @ManyToMany(() => UserEntity, (user) => user.offices)
  @JoinTable({ name: "office_staff" })
  staff!: UserEntity[];

  // @OneToMany(() => AppointmentEntity, (appointment) => appointment.officeId)
  // appointments?: AppointmentEntity[];
}
