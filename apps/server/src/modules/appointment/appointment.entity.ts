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

  @Column({ type: "varchar", nullable: true })
  officeId!: string | null;

  // ToDo: Check with ANA team
  @ManyToOne(() => OfficeEntity, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "officeId" })
  office!: OfficeEntity | null;

  @Column({ type: "varchar", nullable: true })
  patientId!: string | null;

  @Column({ type: "varchar" })
  date!: string;

  @Column({ type: "int" })
  hour!: number;

  @Column({ type: "enum", enum: Object.values(AppointmentStatus) })
  status!: AppointmentStatus;

  @Column()
  note!: string;
}
