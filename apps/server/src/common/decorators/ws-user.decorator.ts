import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Socket } from "socket.io";
import type { AuthUser } from "../../auth/strategies/jwt.strategy";

export const WsUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const client: Socket = ctx.switchToWs().getClient();
    return client.data.user as AuthUser;
  }
);
