import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
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
import { createOfficeSchema, updateOfficeSchema } from "@clinio/shared";
import { OfficeService } from "./office.service";
import { CreateOfficeDto } from "./dto/create-office.dto";
import { UpdateOfficeDto } from "./dto/update-office.dto";
import { Office } from "./dto/office.dto";
import { OfficeMapper } from "./mapper/OfficeMapper";

@Controller("offices")
@ApiTags("Office")
export class OfficeController {
  constructor(private readonly officeService: OfficeService) {}

  @Get()
  @ApiOperation({ operationId: "getOffices" })
  @ApiOkResponse({ type: [Office] })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  async getAll() {
    const entities = await this.officeService.findAll();
    return OfficeMapper.toDtoList(entities);
  }

  @Get(":id")
  @ApiOperation({ operationId: "getOfficeById" })
  @ApiOkResponse({ type: Office })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  @ApiNotFoundResponse({ description: "Office not found" })
  async getById(@Param("id", ParseUUIDPipe) id: string) {
    const entity = await this.officeService.findById(id);
    return OfficeMapper.toDto(entity);
  }

  @Post()
  @ApiOperation({ operationId: "createOffice" })
  @ApiCreatedResponse({ type: Office })
  @ApiBadRequestResponse({ description: "Bad Request" })
  @UsePipes(new ZodValidationPipe(createOfficeSchema))
  async create(@Body() dto: CreateOfficeDto) {
    const entity = await this.officeService.create(dto);
    return OfficeMapper.toDto(entity);
  }

  @Put(":id")
  @ApiOperation({ operationId: "replaceOffice" })
  @ApiOkResponse({ type: Office })
  @ApiBadRequestResponse({ description: "Bad Request" })
  @ApiNotFoundResponse({ description: "Office not found" })
  @UsePipes(new ZodValidationPipe(createOfficeSchema))
  async replace(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateOfficeDto
  ) {
    const entity = await this.officeService.replace(id, dto);
    return OfficeMapper.toDto(entity);
  }

  @Patch(":id")
  @ApiOperation({ operationId: "updateOffice" })
  @ApiOkResponse({ type: Office })
  @ApiBadRequestResponse({ description: "Bad Request" })
  @ApiNotFoundResponse({ description: "Office not found" })
  @UsePipes(new ZodValidationPipe(updateOfficeSchema))
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateOfficeDto
  ) {
    const entity = await this.officeService.update(id, dto);
    return OfficeMapper.toDto(entity);
  }

  @Delete(":id")
  @ApiOperation({ operationId: "deleteOffice" })
  @ApiOkResponse({ description: "Office deleted successfully" })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  @ApiNotFoundResponse({ description: "Office not found" })
  async delete(@Param("id", ParseUUIDPipe) id: string) {
    return this.officeService.remove(id);
  }
}
