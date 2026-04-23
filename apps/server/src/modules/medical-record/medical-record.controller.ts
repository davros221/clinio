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
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import {
  createMedicalRecordSchema,
  medicalRecordListSchema,
  MedicalRecordSortField,
  SortOrder,
  UserRole,
} from "@clinio/shared";
import { MedicalRecordService } from "./medical-record.service";
import { CreateMedicalRecordDto } from "./dto/create-medical-record.dto";
import { MedicalRecordListQueryDto } from "./dto/medical-record-list-query.dto";
import { MedicalRecord } from "./dto/medical-record.dto";
import { MedicalRecordMapper } from "./mapper/MedicalRecordMapper";
import { PaginatedResponseDto } from "../../common/dto/paginated-response.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { type AuthUser } from "../../auth/strategies/jwt.strategy";

const PaginatedMedicalRecordResponse = PaginatedResponseDto(MedicalRecord);

@Controller("patients/:patientId/medical-records")
@ApiTags("MedicalRecord")
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Get()
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.CLIENT)
  @ApiOperation({ operationId: "getPatientMedicalRecords" })
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
    enum: MedicalRecordSortField,
    description: "Sort field (default: createdAt)",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    enum: SortOrder,
    description: "Sort order (default: DESC)",
  })
  @ApiOkResponse({ type: PaginatedMedicalRecordResponse })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiNotFoundResponse({ description: "Patient not found" })
  async getAll(
    @CurrentUser() currentUser: AuthUser,
    @Param("patientId", ParseUUIDPipe) patientId: string,
    @Query(new ZodValidationPipe(medicalRecordListSchema))
    query: MedicalRecordListQueryDto
  ) {
    const { items, total } = await this.medicalRecordService.findAllForPatient(
      patientId,
      query,
      currentUser
    );
    return {
      items: MedicalRecordMapper.toDtoList(items),
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  @Get(":id")
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.CLIENT)
  @ApiOperation({ operationId: "getPatientMedicalRecordById" })
  @ApiOkResponse({ type: MedicalRecord })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiNotFoundResponse({ description: "Medical record not found" })
  async getById(
    @CurrentUser() currentUser: AuthUser,
    @Param("patientId", ParseUUIDPipe) patientId: string,
    @Param("id", ParseUUIDPipe) id: string
  ) {
    const entity = await this.medicalRecordService.findById(
      patientId,
      id,
      currentUser
    );
    return MedicalRecordMapper.toDto(entity);
  }

  @Post()
  @Roles(UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ operationId: "createPatientMedicalRecord" })
  @ApiCreatedResponse({ type: MedicalRecord })
  @ApiBadRequestResponse({ description: "Bad Request" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiNotFoundResponse({ description: "Patient not found" })
  async create(
    @CurrentUser() currentUser: AuthUser,
    @Param("patientId", ParseUUIDPipe) patientId: string,
    @Body(new ZodValidationPipe(createMedicalRecordSchema))
    dto: CreateMedicalRecordDto
  ) {
    const entity = await this.medicalRecordService.create(
      patientId,
      dto,
      currentUser
    );
    return MedicalRecordMapper.toDto(entity);
  }

  @Delete(":id")
  @Roles(UserRole.DOCTOR, UserRole.NURSE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ operationId: "deletePatientMedicalRecord" })
  @ApiNoContentResponse({ description: "Medical record deleted" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiNotFoundResponse({ description: "Medical record not found" })
  async remove(
    @CurrentUser() currentUser: AuthUser,
    @Param("patientId", ParseUUIDPipe) patientId: string,
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<void> {
    await this.medicalRecordService.remove(patientId, id, currentUser);
  }
}
