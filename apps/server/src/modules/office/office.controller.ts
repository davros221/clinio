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
  UserRole,
} from "@clinio/shared";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { type AuthUser } from "../../auth/strategies/jwt.strategy";
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
    @CurrentUser() user: AuthUser,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: string
  ) {
    const query = officeListSchema.parse({ page, limit, sortBy, sortOrder });
    const { items, total } = await this.officeService.findAll(
      query,
      user,
      search
    );
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
  @Roles(UserRole.ADMIN)
  @ApiOperation({ operationId: "createOffice" })
  @ApiCreatedResponse({ type: Office })
  @ApiBadRequestResponse({ description: "Bad Request" })
  @UsePipes(new ZodValidationPipe(createOfficeSchema))
  async create(@Body() dto: CreateOfficeDto) {
    const entity = await this.officeService.create(dto);
    return OfficeMapper.toDto(entity);
  }

  @Put(":id")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ operationId: "replaceOffice" })
  @ApiOkResponse({ type: Office })
  @ApiBadRequestResponse({ description: "Bad Request" })
  @ApiNotFoundResponse({ description: "Office not found" })
  async replace(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(createOfficeSchema)) dto: CreateOfficeDto,
    @CurrentUser() user: AuthUser
  ) {
    const entity = await this.officeService.replace(id, dto, user);
    return OfficeMapper.toDto(entity);
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ operationId: "updateOffice" })
  @ApiOkResponse({ type: Office })
  @ApiBadRequestResponse({ description: "Bad Request" })
  @ApiNotFoundResponse({ description: "Office not found" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateOfficeSchema)) dto: UpdateOfficeDto,
    @CurrentUser() user: AuthUser
  ) {
    const entity = await this.officeService.update(id, dto, user);
    return OfficeMapper.toDto(entity);
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ operationId: "deleteOffice" })
  @ApiOkResponse({ description: "Office deleted successfully" })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  @ApiNotFoundResponse({ description: "Office not found" })
  async delete(@Param("id", ParseUUIDPipe) id: string) {
    return this.officeService.remove(id);
  }
}
