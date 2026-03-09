import {
  Body,
  Controller,
  Delete,
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
import { Public } from "../../common/decorators/public.decorator";
import { type CreateUserDto } from "./dto/create-user.dto";
import { ZodValidationPipe } from "nestjs-zod";
import { UserService } from "./user.service";
import { createUserSchema } from "@clinio/shared";
import { UserMapper } from "./mapper/UserMapper";
import { User } from "./dto/user.dto";

@Controller("users")
@ApiTags("User")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ operationId: "get" })
  @ApiOkResponse({ type: [User] })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  async getAll() {
    const entities = await this.userService.findAll();
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
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async create(@Body() dto: CreateUserDto) {
    const entity = await this.userService.create(dto);
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
