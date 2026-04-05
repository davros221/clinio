import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../common/decorators/public.decorator";

@Controller()
@ApiTags("App")
export class AppController {
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
}
