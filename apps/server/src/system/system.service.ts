import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import * as bcrypt from "bcryptjs";
import { UserService } from "../modules/user/user.service";
import { forbidden, shutdownRateLimited } from "../common/error-messages";

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 60 * 60 * 1000;

@Injectable()
export class SystemService {
  private failedAttempts = 0;
  private lockedUntil: Date | null = null;

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private userService: UserService
  ) {}

  async shutdown(adminEmail: string, password: string): Promise<void> {
    if (this.lockedUntil) {
      const now = new Date();
      if (now < this.lockedUntil) {
        const retryAfterSeconds = Math.ceil(
          (this.lockedUntil.getTime() - now.getTime()) / 1000
        );
        throw shutdownRateLimited(retryAfterSeconds);
      }
      this.lockedUntil = null;
      this.failedAttempts = 0;
    }

    const admin = await this.userService.findByEmail(adminEmail);
    if (
      !admin ||
      !admin.password ||
      !(await bcrypt.compare(password, admin.password))
    ) {
      this.failedAttempts++;
      if (this.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        this.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      }
      throw forbidden();
    }

    this.failedAttempts = 0;
    this.lockedUntil = null;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.query(`
        TRUNCATE TABLE
          "user", "patient", "appointment", "medical_record",
          "office", "room", "message", "room_read_cursor"
        RESTART IDENTITY CASCADE
      `);
    } finally {
      await queryRunner.release();
    }

    this.userService.invalidateInitializedCache();
  }
}
