import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import {
  createAppointmentSchema,
  appointmentListSchema,
  UserRole,
  AppointmentStatus,
  AppointmentSortField,
  SortOrder,
} from "@clinio/shared";
import { ParseEnumArrayPipe } from "../../common/pipes/parse-enum-array.pipe";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthUser } from "../../auth/strategies/jwt.strategy";
import { AppointmentService } from "./appointment.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { Appointment } from "./dto/appointment.dto";
import { AppointmentMapper } from "./mapper/AppointmentMapper";
import { PaginatedResponseDto } from "../../common/dto/paginated-response.dto";

const PaginatedAppointmentResponse = PaginatedResponseDto(Appointment);

@Controller("appointments")
@ApiTags("Appointment")
@Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.CLIENT)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  @ApiOperation({ operationId: "getAppointments" })
  @ApiQuery({
    name: "status",
    required: false,
    enum: AppointmentStatus,
    isArray: true,
    description: "Filter by status",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page (default: 20, max: 100)",
  })
  @ApiQuery({
    name: "sortBy",
    required: false,
    enum: AppointmentSortField,
    description: "Sort field (default: date)",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    enum: SortOrder,
    description: "Sort order (default: ASC)",
  })
  @ApiQuery({
    name: "officeId",
    required: false,
    type: String,
    description: "Filter by office (required for DOCTOR/NURSE)",
  })
  @ApiOkResponse({ type: PaginatedAppointmentResponse })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  async getAll(
    @CurrentUser() currentUser: AuthUser,
    @Query("status") status?: AppointmentStatus | AppointmentStatus[],
    @Query("officeId", new ParseUUIDPipe({ optional: true }))
    officeId?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: string
  ) {
    const statuses = status
      ? new ParseEnumArrayPipe(AppointmentStatus).transform(status)
      : undefined;
    const query = appointmentListSchema.parse({
      page,
      limit,
      sortBy,
      sortOrder,
    });
    const { items, total } = await this.appointmentService.findAll(
      query,
      currentUser,
      statuses,
      officeId
    );
    return {
      items: AppointmentMapper.toDtoList(items),
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  @Get(":id")
  @ApiOperation({ operationId: "getAppointmentById" })
  @ApiOkResponse({ type: Appointment })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  @ApiNotFoundResponse({ description: "Appointment not found" })
  async getById(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthUser
  ) {
    const entity = await this.appointmentService.findById(id, currentUser);
    return AppointmentMapper.toDto(entity);
  }

  @Post()
  @ApiOperation({ operationId: "createAppointment" })
  @ApiCreatedResponse({ type: Appointment })
  @ApiBadRequestResponse({ description: "Bad Request" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiConflictResponse({ description: "Appointment slot already taken" })
  async create(
    @Body(new ZodValidationPipe(createAppointmentSchema))
    dto: CreateAppointmentDto,
    @CurrentUser() currentUser: AuthUser
  ) {
    const entity = await this.appointmentService.create(dto, currentUser);
    return AppointmentMapper.toDto(entity);
  }

  @Delete(":id")
  @Roles(UserRole.DOCTOR, UserRole.NURSE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ operationId: "deleteAppointment" })
  @ApiNoContentResponse({ description: "Appointment deleted" })
  @ApiBadRequestResponse({ description: "Appointment already completed" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiNotFoundResponse({ description: "Appointment not found" })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  async remove(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthUser
  ): Promise<void> {
    await this.appointmentService.remove(id, currentUser);
  }
}
