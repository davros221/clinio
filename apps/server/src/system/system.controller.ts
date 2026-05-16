import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { UserRole } from "@clinio/shared";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../auth/strategies/jwt.strategy";
import { UserService } from "../modules/user/user.service";
import { SystemService } from "./system.service";
import { ShutdownDto } from "./dto/shutdown.dto";

@Controller("system")
@ApiTags("System")
export class SystemController {
  constructor(
    private readonly userService: UserService,
    private readonly systemService: SystemService
  ) {}

  @Get("health")
  @Public()
  @ApiOperation({ operationId: "healthCheck" })
  health() {
    return {
      status: "ok",
      version: process.env.APP_VERSION,
      commit: process.env.GIT_COMMIT,
      buildTime: process.env.BUILD_TIME,
    };
  }

  @Get("status")
  @Public()
  @ApiOperation({ operationId: "getAppStatus" })
  @ApiOkResponse({
    schema: {
      type: "object",
      properties: { initialized: { type: "boolean" } },
    },
  })
  async status() {
    return { initialized: await this.userService.isInitialized() };
  }

  @Post("shutdown")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ operationId: "shutdown" })
  @ApiNoContentResponse({
    description: "Application data cleared successfully",
  })
  async shutdown(
    @CurrentUser() currentUser: AuthUser,
    @Body() dto: ShutdownDto
  ): Promise<void> {
    await this.systemService.shutdown(currentUser.email, dto.password);
  }
}
