import { Controller, Post, Res, Req, HttpCode, HttpStatus, NotFoundException } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UserLogSchedulerService } from "./user-log-scheduler.service";
import type { Response, Request } from "express";

@ApiTags("Documents")
@ApiBearerAuth()
@Controller("documents")
export class DocumentController {
  constructor(
    private readonly userLogSchedulerService: UserLogSchedulerService
  ) {}

  @Post("download-my-logs")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Generate and stream your execution logs as a Word document",
  })
  @ApiResponse({
    status: 200,
    description: "Word document downloaded successfully.",
  })
  async downloadLogs(@Req() req: Request, @Res() res: Response) {
    // 1. Get the authenticated user's ID
    const userId = req.user?.id;
    if (!userId) {
      throw new NotFoundException("User context not found in request.");
    }

    // 2. Generate the Buffer
    const docBuffer = await this.userLogSchedulerService.getUserLogBuffer(
      userId
    );

    // 3. Set headers to force browser download
    res.set({
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": 'attachment; filename="My_Execution_Logs.docx"',
      "Content-Length": docBuffer.length,
    });

    // 4. Stream the buffer directly to the client
    res.end(docBuffer);
  }
}