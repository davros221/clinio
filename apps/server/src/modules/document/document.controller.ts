import { Controller, Post, HttpCode, HttpStatus } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UserLogSchedulerService } from "./user-log-scheduler.service";

@ApiTags("Documents")
@ApiBearerAuth() // Ensures Swagger attaches your JWT token!
@Controller("documents")
export class DocumentController {
  constructor(
    private readonly userLogSchedulerService: UserLogSchedulerService
  ) {}

  @Post("process-logs")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "Manually trigger the processing of execution logs into Word documents",
  })
  @ApiResponse({
    status: 200,
    description: "Logs successfully processed and saved to user directories.",
  })
  async processLogs() {
    await this.userLogSchedulerService.processUserLogs();

    return {
      success: true,
      message: "Log processing pipeline executed successfully.",
    };
  }
}