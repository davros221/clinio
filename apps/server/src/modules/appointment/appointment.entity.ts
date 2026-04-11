import {
  Column,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AppointmentStatus } from "@clinio/shared";
import { OfficeEntity } from "../office/office.entity";
import { PatientEntity } from "../patient/patient.entity";

@Entity("appointments")
@Index("idx_appointment_officeId", ["officeId"])
@Index("idx_appointment_status", ["status"], {
  where: `"status" = 'PLANNED'`,
})
@Index("idx_appointment_date", ["date"])
export class AppointmentEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  officeId!: string;

  @ManyToOne(() => OfficeEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "officeId" })
  office!: OfficeEntity | null;

  @Column({ type: "varchar", nullable: true })
  patientId!: string | null;

  @ManyToOne(() => PatientEntity, { nullable: true })
  @JoinColumn({ name: "patientId" })
  patient!: PatientEntity | null;

  @Column({ type: "varchar" })
  date!: string;

  @Column({ type: "int" })
  hour!: number;

  @Column({ type: "enum", enum: Object.values(AppointmentStatus) })
  status!: AppointmentStatus;

  @Column()
  note!: string;
}
