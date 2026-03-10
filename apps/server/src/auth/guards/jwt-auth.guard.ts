import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "../../common/decorators/public.decorator";
import { unauthorized } from "../../common/error-messages";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  private isPublic = false;

  override canActivate(context: ExecutionContext) {
    this.isPublic =
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    return super.canActivate(context);
  }

  override handleRequest<T>(err: Error | null, user: T): T {
    // For public routes, dont throw 401 error ( this is because of /me route which is public but still needs to access the user if token is provided )
    if (this.isPublic) {
      return user;
    }

    if (err || !user) {
      throw unauthorized();
    }
    return user;
  }
}
