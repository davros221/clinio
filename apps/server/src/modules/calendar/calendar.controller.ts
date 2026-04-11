import { Controller, Get, Query } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { getCalendarQuerySchema, UserRole } from "@clinio/shared";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthUser } from "../../auth/strategies/jwt.strategy";
import { CalendarService } from "./calendar.service";
import { CalendarDay } from "./dto/calendar.dto";

@Controller("calendar")
@ApiTags("Calendar")
@Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.CLIENT)
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
  @ApiForbiddenResponse({ description: "Forbidden" })
  async getCalendar(
    @CurrentUser() currentUser: AuthUser,
    @Query("officeId") officeId: string,
    @Query("timestamp") timestamp: number
  ): Promise<CalendarDay[]> {
    getCalendarQuerySchema.parse({ officeId, timestamp: Number(timestamp) });
    const date = new Date(timestamp);
    return this.calendarService.getWeek(officeId, date, currentUser);
  }
}
