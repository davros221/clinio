import { Controller, Get, Query, UsePipes } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import { getCalendarQuerySchema } from "@clinio/shared";
import { CalendarService } from "./calendar.service";
import { CalendarDay } from "./dto/calendar.dto";

@Controller("calendar")
@ApiTags("Calendar")
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @ApiOperation({ operationId: "getCalendar" })
  @ApiQuery({
    name: "officeId",
    required: true,
    type: String,
    description: "Office UUID",
  })
  @ApiQuery({
    name: "timestamp",
    required: true,
    type: Number,
    description:
      "Unix timestamp (ms) — calendar returns the week containing this date",
  })
  @ApiOkResponse({ type: [CalendarDay] })
  @ApiBadRequestResponse({ description: "Bad Request" })
  @UsePipes(new ZodValidationPipe(getCalendarQuerySchema))
  async getCalendar(
    @Query("officeId") officeId: string,
    @Query("timestamp") timestamp: number
  ): Promise<CalendarDay[]> {
    const date = new Date(timestamp);
    return this.calendarService.getWeek(officeId, date);
  }
}
