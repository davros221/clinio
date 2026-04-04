import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UsePipes,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import {
  updatePatientSchema,
  patientListSchema,
  UserRole,
  PatientSortField,
  SortOrder,
} from "@clinio/shared";
import { PatientService } from "./patient.service";
import { PatientListQueryDto } from "./dto/patient-list-query.dto";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import { Patient } from "./dto/patient.dto";
import { PatientMapper } from "./mapper/PatientMapper";
import { PaginatedResponseDto } from "../../common/dto/paginated-response.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { type AuthUser } from "../../auth/strategies/jwt.strategy";

const PaginatedPatientResponse = PaginatedResponseDto(Patient);

@Controller("patients")
@ApiTags("Patient")
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get()
  @Roles(UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ operationId: "getPatients" })
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    description: "Search by first name or last name",
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
    enum: PatientSortField,
    description: "Sort field (default: lastName)",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    enum: SortOrder,
    description: "Sort order (default: ASC)",
  })
  @ApiOkResponse({ type: PaginatedPatientResponse })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UsePipes(new ZodValidationPipe(patientListSchema))
  async getAll(@Query() query: PatientListQueryDto) {
    const { search, ...listQuery } = query;
    const { items, total } = await this.patientService.findAll(
      listQuery,
      search
    );
    return {
      items: PatientMapper.toDtoList(items),
      total,
      page: listQuery.page,
      limit: listQuery.limit,
      totalPages: Math.ceil(total / listQuery.limit),
    };
  }

  @Get(":id")
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.CLIENT)
  @ApiOperation({ operationId: "getPatientById" })
  @ApiOkResponse({ type: Patient })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiNotFoundResponse({ description: "Patient not found" })
  async getById(
    @CurrentUser() currentUser: AuthUser,
    @Param("id", ParseUUIDPipe) id: string
  ) {
    const entity = await this.patientService.findById(id, currentUser);
    return PatientMapper.toDto(entity);
  }

  @Patch(":id")
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.CLIENT)
  @ApiOperation({ operationId: "updatePatient" })
  @ApiOkResponse({ type: Patient })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiNotFoundResponse({ description: "Patient not found" })
  @UsePipes(new ZodValidationPipe(updatePatientSchema))
  async update(
    @CurrentUser() currentUser: AuthUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdatePatientDto
  ) {
    const entity = await this.patientService.update(id, dto, currentUser);
    return PatientMapper.toDto(entity);
  }
}
