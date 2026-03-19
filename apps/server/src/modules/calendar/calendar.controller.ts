import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CalendarService } from "./calendar.service";
import { CalendarDay } from "./dto/calendar.dto";

@Controller("calendar")
@ApiTags("Calendar")
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  // @Get(":doctorId")
  @Get()
  @ApiOperation({ operationId: "getCalendar" })
  @ApiOkResponse({ type: [CalendarDay] })
  async getCalendar(): // ToDo: For mock, parameters are not active
  // @Param("doctorId", ParseUUIDPipe) doctorId: string,
  // @Query(new ZodValidationPipe(getCalendarQuerySchema)) query: GetCalendarQueryDto
  Promise<CalendarDay[]> {
    const res = await this.calendarService.getWeek(new Date());
    return res;
  }
}
