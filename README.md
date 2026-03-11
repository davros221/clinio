# ClinIO Unicorn University project

## Scripts

| Script                | Description                              |
| --------------------- | ---------------------------------------- |
| `pnpm server:dev`     | Run backend server in development mode   |
| `pnpm server:build`   | Create backend production build          |
| `pnpm client:dev`     | Run frontend server in development mode  |
| `pnpm client:build`   | Create frontend production build         |
| `pnpm prettier:check` | Check if code is formatted with prettier |
| `pnpm prettier:fix`   | Fix code formatting with prettier        |
| `pnpm eslint:check`   | Check code with eslint                   |
| `pnpm eslint:fix`     | Fix code with eslint                     |
| `pnpm codegen:api`    | Generate client code from OpenAPI spec   |

## Installation

- clone the repository
- run `pnpm install` to install dependencies
- run database locally
  - `cd infra`
  - `docker-compose up -d`
- Run backend server `pnpm dev:server`
- Run frontend server `pnpm dev:client`

## Formatting and linting

- set your IDE to format code with prettier on save, or run prettier before commit

### Scripts:

- `pnpm prettier:check` - check if code is formatted with prettier
- `pnpm prettier:fix` - fix code formatting with prettier
- `pnpm eslint:check` - check code with eslint
- `pnpm eslint:fix` - fix code with eslint

## OpenAPI

After running the server

- SwaggerUI is available at `http://localhost:8000/api`
- OpenAPI spec is available at `http://localhost:8000/api-json`

### Generating client code:

- run `pnpm codegen:api` to generate client code from OpenAPI spec,
- The code is generated in `packages/api` package
- You can import generated code from `@clinio/api` package in your frontend code

#### Naming convention

- Generated code is divided into classes based on tags and operationId in the format `{tag}Service.{operationId}`. For example, for tag `User` and operation `getById`, the generated method will be `UserService.getById()`.

## Monorepo structure

- apps
  - client: React frontend application
  - server: Nest.js backend application
- packages
  - api: generated client code from OpenAPI spec
  - shared: shared code between frontend and backend (e.g. types, validation schemas, error codes)
- infra
  - docker-compose.yml: Docker configuration for running database locally
- openapi-ts.config.ts: OpenAPI codegen configuration file

## Backend

### Project structure

- app: main application code
- auth: authentication and authorization code ( guards, strategies )
- common: common utilities and code (e.g. error handling, validation)
- config: configuration files and code (e.g. database configuration, environment variables)
- database: database configuration
- modules: feature modules (e.g. user, appointment, etc.)
- openapi: OpenAPI configuration and code (e.g. controllers, DTOs, etc.)

### Documenting APIs

We use **OpenAPI** and **Swagger** to document and generate API contracts. Validation schemas are shared between frontend and backend using **Zod** (defined in `@clinio/shared`).

#### Response DTOs

Response DTOs are plain classes decorated with `@ApiProperty()` from `@nestjs/swagger`. Swagger uses these decorators to generate the response schema.

```typescript
import { ApiProperty } from "@nestjs/swagger";

export class AuthResponse {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: AuthData })
  authData!: AuthData;
}
```

#### Request DTOs (Zod-based)

Request DTOs are generated from shared Zod schemas using `createZodDto` from `nestjs-zod`. This makes the Zod schema visible to Swagger and ensures the generated OpenAPI spec includes the request body definition.

```typescript
import { createZodDto } from "nestjs-zod";
import { loginSchema } from "@clinio/shared";

export class LoginDto extends createZodDto(loginSchema) {}
```

> **Important:** Do not use `type LoginDto = z.infer<typeof schema>` — Swagger cannot read TypeScript types. Always use `createZodDto` to create a class.

#### Controller documentation

Every controller must include the following decorators:

- **`@ApiTags("EntityName")`** — groups endpoints in SwaggerUI. Use singular entity name (e.g. `User`, `Auth`, `Appointment`).
- **`@ApiOperation({ operationId: "methodName" })`** — required on every endpoint. The `operationId` determines the generated client method name.
- **Success responses** — use `@ApiOkResponse({ type: ResponseDto })`, `@ApiCreatedResponse()`, etc. Always specify the `type`.
- **Error responses** — document expected errors with `@ApiBadRequestResponse()`, `@ApiUnauthorizedResponse()`, `@ApiNotFoundResponse()`, etc. Include a `description`.
- **`@ApiBearerAuth()`** — add to endpoints that require authentication.

Example:

```typescript
@Controller("auth")
@ApiTags("Auth")
export class AuthController {
  @Post("login")
  @ApiOperation({ operationId: "login" })
  @ApiOkResponse({ type: AuthResponse })
  @ApiBadRequestResponse({ description: "Bad Request" })
  @ApiUnauthorizedResponse({ description: "Invalid email or password" })
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }
}
```

### Authorization

Endpoints have 3 access levels:

| Decorator                 | Access                 | HTTP error |
| ------------------------- | ---------------------- | ---------- |
| `@Public()`               | Anyone (no token)      | —          |
| `@Roles(EUserRole.ADMIN)` | Only specified roles   | 403        |
| _(none)_                  | Any authenticated user | 401        |

**API-level** — restrict endpoint to specific roles:

```typescript
import { Roles } from "../common/decorators/roles.decorator";
import { EUserRole } from "@clinio/shared";

@Roles(EUserRole.ADMIN, EUserRole.DOCTOR)
@Get("patients")
findPatients() { ... }
```

**Application-level** — return different data based on role:

```typescript
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../auth/strategies/jwt.strategy";

@Get("dashboard")
getDashboard(@CurrentUser() user: AuthUser) {
  if (user.role === EUserRole.ADMIN) return this.service.getAdminData();
  if (user.role === EUserRole.DOCTOR) return this.service.getDoctorData();
}
```

### Error Handling

- The backend server uses a global error handler to catch and handle errors. The error handler returns a JSON response with the following format:

- Use helper functions in `src/common/error-messages.ts`

```typescript
import { ErrorCode } from "@clinio/shared";
import { notFound } from "./common/error-messages";

throw notFound("User", ErrorCode.USER_NOT_FOUND);
```

## Frontend

### Error Handling

```typescript
import { ErrorCode } from "@clinio/shared";

if (error.error === ErrorCode.USER_NOT_FOUND) {
  toast("Some customized message for an error");
}
```

ToDo: ...
