import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AppointmentStatus } from "@clinio/shared";
import { OfficeEntity } from "../office/office.entity";

@Entity("appointments")
export class AppointmentEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  officeId!: string;

  // ToDo: Check with ANA team
  @ManyToOne(() => OfficeEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "officeId" })
  office!: OfficeEntity;

  @Column({ type: "varchar", nullable: true })
  patientId!: string | null;

  @Column({ type: "timestamptz" })
  datetime!: Date;

  @Column({ type: "enum", enum: Object.values(AppointmentStatus) })
  status!: AppointmentStatus;

  @Column()
  note!: string;
}
