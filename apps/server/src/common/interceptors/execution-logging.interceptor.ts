import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AuthUser } from "../auth/strategies/jwt.strategy"; // 👈 Import your interface

@Injectable()
export class ExecutionLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("ExecutionTracker");
  private readonly ignoredRoutes = ["/api/health", "/api/status"];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;

    if (this.ignoredRoutes.some((route) => url.includes(route))) {
      return next.handle();
    }

    // 👤 1. Extract the AuthUser populated by your JwtStrategy
    const user = req.user as AuthUser | undefined;

    // 👤 2. Build a smart identity string
    let identity = "Anonymous";
    if (user) {
      // If logged in, we get the ID and the Role!
      identity = `User: ${user.id} | Role: ${user.role}`;
    } else if (url.includes("/auth/login") && req.body?.email) {
      // If they are trying to log in, grab the email they are attempting to use
      identity = `LoginAttempt: ${req.body.email}`;
    } else {
      // Fallback to IP address for other public routes
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      identity = `IP: ${ip}`;
    }

    const className = context.getClass().name;
    const handlerName = context.getHandler().name;
    const startTime = Date.now();

    this.logger.log(
      `[${identity}] [START] HTTP ${method} ${url} -> Executing: ${className}.${handlerName}()`
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.log(
          `[${identity}] [END] Completed: ${className}.${handlerName}() in ${duration}ms`
        );
      })
    );
  }
}
