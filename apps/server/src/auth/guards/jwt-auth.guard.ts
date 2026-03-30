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

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Attempt to authenticate but don't fail — allows optional auth on public routes
      try {
        await super.canActivate(context);
      } catch {
        // No valid token — that's fine for public routes
      }
      return true;
    }

    return super.canActivate(context) as Promise<boolean>;
  }

  override handleRequest<T>(err: Error | null, user: T): T {
    if (err || !user) {
      throw unauthorized();
    }
    return user;
  }
}
