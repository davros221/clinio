import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ParseEnumArrayPipe } from "../../common/pipes/parse-enum-array.pipe";
import { UserRole } from "@clinio/shared";
import { CreateUserDto } from "./dto/create-user.dto";
import { ZodValidationPipe } from "nestjs-zod";
import { UserService } from "./user.service";
import { createUserSchema } from "@clinio/shared";
import { UserMapper } from "./mapper/UserMapper";
import { User } from "./dto/user.dto";
import { type AuthUser } from "../../auth/strategies/jwt.strategy";

@Controller("users")
@ApiTags("User")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ operationId: "get" })
  @ApiQuery({
    name: "role",
    enum: UserRole,
    isArray: true,
    required: true,
  })
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    description: "Search by first name or last name",
  })
  @ApiOkResponse({ type: [User] })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  async getAll(
    @CurrentUser() currentUser: AuthUser,
    @Query("role") roles: UserRole | UserRole[] | undefined,
    @Query("search") search?: string
  ) {
    const parsed = new ParseEnumArrayPipe(UserRole).transform(roles);
    const entities = await this.userService.findAll(
      currentUser,
      parsed,
      search
    );
    return UserMapper.toDtoList(entities);
  }

  @Get(":id")
  @ApiOperation({ operationId: "getById" })
  @ApiOkResponse({ type: User })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  @ApiNotFoundResponse({ description: "User not found" })
  async getById(@Param("id", ParseUUIDPipe) id: string) {
    const entity = await this.userService.findById(id);
    return UserMapper.toDto(entity);
  }

  @Public()
  @Post()
  @ApiOperation({ operationId: "create" })
  @ApiCreatedResponse({ type: User })
  @ApiBadRequestResponse({ description: "Bad Request" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  async create(
    @CurrentUser() currentUser: AuthUser | undefined,
    @Body(new ZodValidationPipe(createUserSchema)) dto: CreateUserDto
  ) {
    const entity = await this.userService.create(dto, currentUser);
    return UserMapper.toDto(entity);
  }

  @Delete(":id")
  @ApiOperation({ operationId: "delete" })
  @ApiOkResponse({ description: "User deleted successfully" })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  @ApiNotFoundResponse({ description: "User not found" })
  async delete(@Param("id") id: string) {
    return this.userService.remove(id);
  }
}
