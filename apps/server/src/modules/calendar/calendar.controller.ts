import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CalendarService } from "./calendar.service";
import { CalendarDay } from "./dto/calendar.dto";

@Controller("calendar")
@ApiTags("Calendar")
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @ApiOperation({ operationId: "getCalendar" })
  @ApiQuery({ name: "officeId", required: true, type: String, description: "Office UUID" })
  @ApiQuery({
    name: "timestamp",
    required: true,
    type: Number,
    description: "Unix timestamp (ms) — calendar returns the week containing this date",
  })
  @ApiOkResponse({ type: [CalendarDay] })
  async getCalendar(@Query("officeId") officeId: string, @Query("timestamp") timestamp: string): Promise<CalendarDay[]> {
    const date = new Date(Number(timestamp));
    return this.calendarService.getWeek(officeId, date);
  }
}
