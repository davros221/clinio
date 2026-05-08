import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../common/decorators/public.decorator";
import { UserService } from "../modules/user/user.service";

@Controller()
@ApiTags("App")
export class AppController {
  constructor(private readonly userService: UserService) {}

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
}
