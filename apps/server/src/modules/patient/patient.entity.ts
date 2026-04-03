import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("patients")
export class PatientEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  birthNumber!: string;

  @Column({ type: "date" })
  birthdate!: Date;

  @Column()
  phone!: string;

  @Column()
  email!: string;
}
