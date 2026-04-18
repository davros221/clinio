import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "../user/user.entity";

@Entity("patients")
export class PatientEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => UserEntity, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: UserEntity;

  @Column({ nullable: true, type: "varchar" })
  birthNumber?: string | null;

  @Column({ type: "date", nullable: true })
  birthdate?: Date | null;

  @Column({ nullable: true, type: "varchar" })
  phone?: string | null;
}
