import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@clinio/shared";
import { ROLES_KEY } from "../../common/decorators/roles.decorator";
import { IS_PUBLIC_KEY } from "../../common/decorators/public.decorator";
import { forbidden } from "../../common/error-messages";
import { AuthUser } from "../strategies/jwt.strategy";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser;

    if (!user || !requiredRoles.includes(user.role)) {
      throw forbidden();
    }

    return true;
  }
}
