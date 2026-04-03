import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UsePipes } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import {
  createAppointmentSchema,
  UserRole,
  AppointmentStatus,
  AppointmentSortField,
  SortOrder,
  appointmentListSchema,
} from "@clinio/shared";
import { ParseEnumArrayPipe } from "../../common/pipes/parse-enum-array.pipe";
import { Roles } from "../../common/decorators/roles.decorator";
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
  @ApiOkResponse({ type: PaginatedAppointmentResponse })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  async getAll(
    @Query("status") status?: AppointmentStatus | AppointmentStatus[],
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: string
  ) {
    const statuses = status ? new ParseEnumArrayPipe(AppointmentStatus).transform(status) : undefined;
    const query = appointmentListSchema.parse({
      page,
      limit,
      sortBy,
      sortOrder,
    });
    const { items, total } = await this.appointmentService.findAll(query, statuses);
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
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  @ApiNotFoundResponse({ description: "Appointment not found" })
  async getById(@Param("id", ParseUUIDPipe) id: string) {
    const entity = await this.appointmentService.findById(id);
    return AppointmentMapper.toDto(entity);
  }

  @Post()
  @ApiOperation({ operationId: "createAppointment" })
  @ApiCreatedResponse({ type: Appointment })
  @ApiBadRequestResponse({ description: "Bad Request" })
  @UsePipes(new ZodValidationPipe(createAppointmentSchema))
  async create(@Body() dto: CreateAppointmentDto) {
    const entity = await this.appointmentService.create(dto);
    return AppointmentMapper.toDto(entity);
  }
}
