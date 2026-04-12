import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiTags,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { Public } from "../common/decorators/public.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RequestPasswordResetDto } from "./dto/request-password-reset.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import {
  ResetPasswordResponse,
  AuthResponse,
  MeResponse,
} from "./dto/auth-response.dto";
import {
  loginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@clinio/shared";

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

  @Public()
  @Post("request-password-reset")
  @UseGuards(ThrottlerGuard)
  @Throttle({ "password-reset": { ttl: 60_000, limit: 3 } })
  @ApiOperation({ operationId: "requestPasswordReset" })
  @ApiOkResponse({ description: "Password reset email sent" })
  @ApiNotFoundResponse({ description: "User not found" })
  @UsePipes(new ZodValidationPipe(requestPasswordResetSchema))
  async requestPasswordReset(
    @Body() dto: RequestPasswordResetDto
  ): Promise<{ success: boolean }> {
    await this.authService.requestPasswordReset(dto.email);
    return { success: true };
  }

  @Public()
  @Post("reset-password")
  @ApiOperation({ operationId: "resetPassword" })
  @ApiOkResponse({ type: ResetPasswordResponse })
  @ApiBadRequestResponse({
    description: "Invalid or expired reset token",
  })
  @UsePipes(new ZodValidationPipe(resetPasswordSchema))
  async resetPassword(
    @Body() dto: ResetPasswordDto
  ): Promise<ResetPasswordResponse> {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Get("me")
  @ApiOperation({ operationId: "me" })
  @ApiOkResponse({ type: MeResponse })
  @ApiBearerAuth()
  me(@CurrentUser() user: { id: string }): Promise<MeResponse> {
    return this.authService.me(user.id);
  }
}
