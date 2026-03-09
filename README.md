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
