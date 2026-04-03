import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthUser } from "../../auth/strategies/jwt.strategy";

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as AuthUser | undefined;
});
