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
import { SendActivationEmailDto } from "./dto/send-activation-email.dto";
import { ActivateAccountDto } from "./dto/activate-account.dto";
import { AuthResponse, MeResponse } from "./dto/auth-response.dto";
import {
  loginSchema,
  sendActivationEmailSchema,
  activateAccountSchema,
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
  @Post("send-activation-email")
  @UseGuards(ThrottlerGuard)
  @Throttle({ "activation-email": { ttl: 60_000, limit: 3 } })
  @ApiOperation({ operationId: "sendActivationEmail" })
  @ApiOkResponse({ description: "Activation email sent" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiForbiddenResponse({ description: "Account already activated" })
  @UsePipes(new ZodValidationPipe(sendActivationEmailSchema))
  async sendActivationEmail(
    @Body() dto: SendActivationEmailDto
  ): Promise<{ success: boolean }> {
    await this.authService.sendActivationEmail(dto.email);
    return { success: true };
  }

  @Public()
  @Post("activate")
  @ApiOperation({ operationId: "activateAccount" })
  @ApiOkResponse({ description: "Account activated" })
  @ApiBadRequestResponse({
    description: "Invalid or expired activation token",
  })
  @ApiForbiddenResponse({ description: "Account already activated" })
  @UsePipes(new ZodValidationPipe(activateAccountSchema))
  async activateAccount(
    @Body() dto: ActivateAccountDto
  ): Promise<{ success: boolean }> {
    await this.authService.activateAccount(dto.token, dto.password);
    return { success: true };
  }

  @Get("me")
  @ApiOperation({ operationId: "me" })
  @ApiOkResponse({ type: MeResponse })
  @ApiBearerAuth()
  me(@CurrentUser() user: { id: string }): Promise<MeResponse> {
    return this.authService.me(user.id);
  }
}
