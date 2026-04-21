import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PatientEntity } from "../patient/patient.entity";
import { UserEntity } from "../user/user.entity";

@Entity("medical_records")
@Index("idx_medical_record_patientId", ["patientId"])
export class MedicalRecordEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  patientId!: string;

  @ManyToOne(() => PatientEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "patientId" })
  patient!: PatientEntity;

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
}
