import { Controller, Get, Query } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import { getCalendarQuerySchema, UserRole } from "@clinio/shared";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { type AuthUser } from "../../auth/strategies/jwt.strategy";
import { CalendarService } from "./calendar.service";
import { CalendarDay } from "./dto/calendar.dto";
import { GetCalendarQueryDto } from "./dto/get-calendar-query.dto";

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
    @Query(new ZodValidationPipe(getCalendarQuerySchema))
    query: GetCalendarQueryDto
  ): Promise<CalendarDay[]> {
    const date = new Date(query.timestamp);
    return this.calendarService.getWeek(query.officeId, date, currentUser);
  }
}
