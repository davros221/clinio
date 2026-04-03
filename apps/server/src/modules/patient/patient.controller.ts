import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UsePipes,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import { createPatientSchema, updatePatientSchema } from "@clinio/shared";
import { PatientService } from "./patient.service";
import { CreatePatientDto } from "./dto/create-patient.dto";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import { Patient } from "./dto/patient.dto";
import { PatientMapper } from "./mapper/PatientMapper";

@Controller("patients")
@ApiTags("Patient")
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get(":id")
  @ApiOperation({ operationId: "getPatientById" })
  @ApiOkResponse({ type: Patient })
  @ApiNotFoundResponse({ description: "Patient not found" })
  async getById(@Param("id", ParseUUIDPipe) id: string) {
    const entity = await this.patientService.findById(id);
    return PatientMapper.toDto(entity);
  }

  @Post()
  @ApiOperation({ operationId: "createPatient" })
  @ApiCreatedResponse({ type: Patient })
  @UsePipes(new ZodValidationPipe(createPatientSchema))
  async create(@Body() dto: CreatePatientDto) {
    const entity = await this.patientService.create(dto);
    return PatientMapper.toDto(entity);
  }

  @Patch(":id")
  @ApiOperation({ operationId: "updatePatient" })
  @ApiOkResponse({ type: Patient })
  @ApiNotFoundResponse({ description: "Patient not found" })
  @UsePipes(new ZodValidationPipe(updatePatientSchema))
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdatePatientDto
  ) {
    const entity = await this.patientService.update(id, dto);
    return PatientMapper.toDto(entity);
  }

  @Delete(":id")
  @ApiOperation({ operationId: "deletePatient" })
  @ApiOkResponse({ description: "Patient deleted successfully" })
  @ApiNotFoundResponse({ description: "Patient not found" })
  async delete(@Param("id", ParseUUIDPipe) id: string) {
    return this.patientService.delete(id);
  }
}
