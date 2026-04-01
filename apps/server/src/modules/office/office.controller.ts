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
  Query,
  UsePipes,
} from "@nestjs/common";
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
  createOfficeSchema,
  updateOfficeSchema,
  OfficeSortField,
  SortOrder,
  officeListSchema,
} from "@clinio/shared";
import { OfficeService } from "./office.service";
import { CreateOfficeDto } from "./dto/create-office.dto";
import { UpdateOfficeDto } from "./dto/update-office.dto";
import { Office } from "./dto/office.dto";
import { OfficeMapper } from "./mapper/OfficeMapper";
import { PaginatedResponseDto } from "../../common/dto/paginated-response.dto";

const PaginatedOfficeResponse = PaginatedResponseDto(Office);

@Controller("offices")
@ApiTags("Office")
export class OfficeController {
  constructor(private readonly officeService: OfficeService) {}

  @Get()
  @ApiOperation({ operationId: "getOffices" })
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    description: "Search by name or specialization",
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
    enum: OfficeSortField,
    description: "Sort field (default: name)",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    enum: SortOrder,
    description: "Sort order (default: ASC)",
  })
  @ApiOkResponse({ type: PaginatedOfficeResponse })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  async getAll(
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: string
  ) {
    const query = officeListSchema.parse({ page, limit, sortBy, sortOrder });
    const { items, total } = await this.officeService.findAll(query, search);
    return {
      items: OfficeMapper.toDtoList(items),
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
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
