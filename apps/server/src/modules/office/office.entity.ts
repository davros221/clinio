import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
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

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "doctorId" })
  doctorId!: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "nurseId" })
  nurseId!: string | null;

  // @OneToMany(() => AppointmentEntity, (appointment) => appointment.officeId)
  // appointments?: AppointmentEntity[];
}
