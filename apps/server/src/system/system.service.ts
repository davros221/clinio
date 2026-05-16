import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import * as bcrypt from "bcryptjs";
import { UserService } from "../modules/user/user.service";
import { forbidden } from "../common/error-messages";

@Injectable()
export class SystemService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private userService: UserService
  ) {}

  async shutdown(adminEmail: string, password: string): Promise<void> {
    const admin = await this.userService.findByEmail(adminEmail);
    if (
      !admin ||
      !admin.password ||
      !(await bcrypt.compare(password, admin.password))
    ) {
      throw forbidden();
    }

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
