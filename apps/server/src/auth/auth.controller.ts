import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import { loginSchema } from "@clinio/shared";
import { Public } from "../common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { type LoginDto } from "./dto/login.dto";
import { AuthResponse } from "./dto/auth-response.dto";

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
}
