import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { DocumentService } from "./document.service";
import { UserService } from "../user/user.service";

@Injectable()
export class UserLogSchedulerService {
  private readonly logger = new Logger(UserLogSchedulerService.name);

  private readonly logDir = path.join(process.cwd(), "logs");
  private readonly activeLogPath = path.join(
    this.logDir,
    "backend-execution.log"
  );

  constructor(
    private readonly documentService: DocumentService,
    private readonly userService: UserService
  ) {}

  async getUserLogBuffer(userId: string): Promise<Buffer> {
    // 1. Check if the user exists and has logging enabled
    const users = await this.userService.findUsersWithLoggingEnabled([userId]);
    if (users.length === 0) {
      throw new NotFoundException(
        "Detailed logging is not enabled for this user."
      );
    }

    // 2. Read the active logs safely
    if (!fs.existsSync(this.activeLogPath)) {
      throw new NotFoundException("No active logs available to process.");
    }

    const rawLogs = fs.readFileSync(this.activeLogPath, "utf-8");
    const logLines = rawLogs
      .split("\n")
      .filter((line) => line.trim().length > 0);

    // 3. Filter logs ONLY for the requesting user
    const userLogPrefix = `[User: ${userId} |`;
    const userLogs = logLines.filter((line) => line.includes(userLogPrefix));

    if (userLogs.length === 0) {
      throw new NotFoundException("No execution logs found for your account.");
    }

    this.logger.log(
      `Generating log stream for User ID: ${userId} (${userLogs.length} entries)`
    );

    // 4. Generate and return the Buffer (No disk writes!)
    return await this.documentService.generateExecutionLogDoc(userLogs);
  }
}
