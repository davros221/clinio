import { Body, Controller, Get, Post, UsePipes } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiTags,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import { Public } from "../common/decorators/public.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { AuthResponse, MeResponse } from "./dto/auth-response.dto";
import { loginSchema } from "@clinio/shared";

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("login")
  @ApiOperation({ operationId: "login" })
  @ApiOkResponse({ type: AuthResponse })
  @ApiBadRequestResponse({ description: "Bad Request" })
  @ApiUnauthorizedResponse({ description: "Invalid email or password" })
  @UsePipes(new ZodValidationPipe(loginSchema))
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Get("me")
  @ApiOperation({ operationId: "me" })
  @ApiOkResponse({ type: MeResponse })
  @ApiBearerAuth()
  me(@CurrentUser() user: { id: string }): Promise<MeResponse> {
    return this.authService.me(user.id);
  }
}
