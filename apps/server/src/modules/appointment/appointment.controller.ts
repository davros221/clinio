import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UsePipes,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import { createAppointmentSchema, UserRole } from "@clinio/shared";
import { Roles } from "../../common/decorators/roles.decorator";
import { AppointmentService } from "./appointment.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { Appointment } from "./dto/appointment.dto";
import { AppointmentMapper } from "./mapper/AppointmentMapper";

@Controller("appointments")
@ApiTags("Appointment")
@Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.CLIENT)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  @ApiOperation({ operationId: "getAppointments" })
  @ApiOkResponse({ type: [Appointment] })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  async getAll() {
    const entities = await this.appointmentService.findAll();
    return AppointmentMapper.toDtoList(entities);
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
