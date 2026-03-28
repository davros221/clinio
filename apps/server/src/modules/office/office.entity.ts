import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OfficeHoursTemplate } from "@clinio/shared";
import { UserEntity } from "../user/user.entity";

@Entity("offices")
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

  @ManyToMany(() => UserEntity, (user) => user.doctorOffices)
  @JoinTable({ name: "office_doctors" })
  doctors!: UserEntity[];

  @ManyToMany(() => UserEntity, (user) => user.nurseOffices)
  @JoinTable({ name: "office_nurses" })
  nurses!: UserEntity[];

  // @OneToMany(() => AppointmentEntity, (appointment) => appointment.officeId)
  // appointments?: AppointmentEntity[];
}
