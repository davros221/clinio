import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OfficeEntity } from "../office/office.entity";
import { PatientEntity } from "../patient/patient.entity";
import { UserEntity } from "../user/user.entity";

@Entity("medical_records")
@Index("idx_medical_record_patientId", ["patientId"])
@Index("idx_medical_record_officeId", ["officeId"])
export class MedicalRecordEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  patientId!: string;

  @ManyToOne(() => PatientEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "patientId" })
  patient!: PatientEntity;

  @Column({ type: "varchar", nullable: true })
  officeId!: string | null;

  @ManyToOne(() => OfficeEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "officeId" })
  office!: OfficeEntity | null;

  @Column()
  createdBy!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "createdBy" })
  creator!: UserEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "text", nullable: true })
  examinationSummary!: string | null;

  @Column({ type: "text", nullable: true })
  diagnosis!: string | null;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deletedAt!: Date | null;
}
