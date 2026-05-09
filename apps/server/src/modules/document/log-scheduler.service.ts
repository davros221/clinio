import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DocumentService } from "./document.service";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class LogSchedulerService {
  private readonly logger = new Logger(LogSchedulerService.name);
  // 👇 Change this path to point to the daily accumulator file
  private readonly logFilePath = path.join(
    process.cwd(),
    "logs",
    "daily-execution.log"
  );
  private readonly archiveDir = path.join(process.cwd(), "logs", "archives");

  constructor(private readonly documentService: DocumentService) {
    // Ensure archive directory exists
    if (!fs.existsSync(this.archiveDir)) {
      fs.mkdirSync(this.archiveDir, { recursive: true });
    }
  }

  // 🕒 Runs every day at exactly midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleNightlyLogArchiving() {
    this.logger.log("Starting nightly log archiving process...");

    try {
      // 1. Check if the log file exists and has data
      if (!fs.existsSync(this.logFilePath)) {
        this.logger.warn("No log file found to archive today.");
        return;
      }

      // 2. Read the raw text file
      const rawLogs = fs.readFileSync(this.logFilePath, "utf-8");

      // Split by newline and remove any empty lines
      const logArray = rawLogs
        .split("\n")
        .filter((line) => line.trim().length > 0);

      if (logArray.length === 0) {
        this.logger.log("Log file is empty. Skipping archive.");
        return;
      }

      // 3. Generate the Word Document using your DocumentService
      const docBuffer = await this.documentService.generateExecutionLogDoc(
        logArray
      );

      // 4. Save the generated .docx file with a timestamp
      const dateString = new Date().toISOString().split("T")[0]; // e.g., '2026-05-09'
      const archiveFilename = `Execution_Logs_${dateString}.docx`;
      const archivePath = path.join(this.archiveDir, archiveFilename);

      fs.writeFileSync(archivePath, docBuffer);
      this.logger.log(`Successfully archived logs to: ${archiveFilename}`);

      // 5. Clear the original log file so tomorrow starts fresh
      fs.writeFileSync(this.logFilePath, "");
      this.logger.log("Cleared original log file for the next cycle.");
    } catch (error) {
      this.logger.error("Failed to archive nightly logs", error);
    }
  }
}
