import { ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard, IAuthModuleOptions } from "@nestjs/passport";
import type { Request } from "express";
import { validateAllowedClientUrl } from "../utils/validate-client-url";

@Injectable()
export class GoogleAuthGuard extends AuthGuard("google") {
  constructor(private configService: ConfigService) {
    super();
  }

  override getAuthenticateOptions(
    context: ExecutionContext
  ): IAuthModuleOptions {
    const req = context.switchToHttp().getRequest<Request>();
    const allowed =
      this.configService.getOrThrow<string[]>("client.allowedUrls");
    const returnTo = validateAllowedClientUrl(req.query.returnTo, allowed);
    return returnTo ? { state: returnTo } : {};
  }
}
