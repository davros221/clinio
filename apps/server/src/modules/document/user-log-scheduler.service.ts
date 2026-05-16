import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
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
  private readonly userArchiveDir = path.join(this.logDir, "users");

  constructor(
    private readonly documentService: DocumentService,
    private readonly userService: UserService
  ) {
    if (!fs.existsSync(this.userArchiveDir)) {
      fs.mkdirSync(this.userArchiveDir, { recursive: true });
    }
  }

  async processUserLogs() {
    if (!fs.existsSync(this.activeLogPath)) return;

    try {
      // 1. Read the active log file
      const rawLogs = fs.readFileSync(this.activeLogPath, "utf-8");

      // 2. Clear the file immediately without deleting it, preserving Winston's stream
      fs.writeFileSync(this.activeLogPath, "");

      const logLines = rawLogs
        .split("\n")
        .filter((line) => line.trim().length > 0);

      if (logLines.length === 0) return;

      this.logger.log(`Processing ${logLines.length} log entries...`);

      // 3. 🧩 Group logs by User ID using Regex
      const logsByUser = new Map<string, string[]>();
      // Matches the UUID up until the space before the pipe
      const userIdRegex = /\[User:\s([a-zA-Z0-9-]+)\s\|/;

      for (const line of logLines) {
        const match = line.match(userIdRegex);
        if (match && match[1]) {
          const userId = match[1];
          if (!logsByUser.has(userId)) logsByUser.set(userId, []);
          logsByUser.get(userId)!.push(line);
        }
      }

      // 4. 🗄️ Query the DB to see who actually has logging enabled
      const userIdsInLog = Array.from(logsByUser.keys());
      const usersRequiringLogs =
        await this.userService.findUsersWithLoggingEnabled(userIdsInLog);

      // 5. 📄 Generate the Word Documents
      for (const user of usersRequiringLogs) {
        const userLogs = logsByUser.get(user.id);
        if (!userLogs || userLogs.length === 0) continue;

        // Note: You could filter `userLogs` here based on `user.logLevel`
        const docBuffer = await this.documentService.generateExecutionLogDoc(
          userLogs
        );

        // Save it to a user-specific folder
        const userDir = path.join(this.userArchiveDir, user.id);
        if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = path.join(userDir, `Logs_${timestamp}.docx`);

        fs.writeFileSync(filename, docBuffer);
        this.logger.log(
          `Generated log document for User ${user.email} -> ${filename}`
        );
      }

      // 6. 🗃️ Append to the daily master log
      const dailyLogPath = path.join(this.logDir, "daily-execution.log");
      fs.appendFileSync(dailyLogPath, rawLogs);
    } catch (error) {
      this.logger.error("Failed to process user logs", error);

      // Safety net: If something crashes during generation, dump the raw logs
      // into daily-execution so they aren't lost forever.
      if (rawLogs) {
        const dailyLogPath = path.join(this.logDir, "daily-execution.log");
        fs.appendFileSync(dailyLogPath, rawLogs);
      }
    }
  }
}
