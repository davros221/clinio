import {
  Column,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { UserRole } from "@clinio/shared";
import { OfficeEntity } from "../office/office.entity";

// 📝 1. Define the Logging Enums
export enum LogLevel {
  INFO = "INFO",
  DEBUG = "DEBUG",
  ERROR = "ERROR",
}

export enum LogScope {
  CONTROLLERS = "CONTROLLERS",
  SERVICES = "SERVICES",
  DATABASE = "DATABASE",
  EXTERNAL_APIS = "EXTERNAL_APIS",
}

@Entity("users")
@Unique(["email"])
@Unique(["googleId"])
@Index("idx_user_role", ["role"])
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  email!: string;

  @Column({ nullable: true, type: "varchar" })
  password?: string | null;

  @Column({ nullable: true, type: "varchar" })
  googleId?: string | null;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ type: "enum", enum: Object.values(UserRole) })
  role!: UserRole;

  @Column({ nullable: true })
  resetToken?: string;

  @Column({ nullable: true })
  resetTokenExpiresAt?: Date;

  @ManyToMany(() => OfficeEntity, (office) => office.staff)
  offices?: OfficeEntity[];

  // 📝 2. Add the Logging Configuration Columns
  @Column({ default: false })
  isDetailedLoggingEnabled!: boolean;

  @Column({ type: "int", default: 60 }) // Default to 60 minutes
  logGenerationInterval!: number;

  @Column({ type: "enum", enum: LogLevel, default: LogLevel.INFO })
  logLevel!: LogLevel;

  @Column({ type: "simple-array", nullable: true })
  logScope?: LogScope[];
}
