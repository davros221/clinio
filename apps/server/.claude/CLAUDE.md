# ClinIO Backend (apps/server)

NestJS 11 backend with TypeORM (PostgreSQL), JWT authentication, and Zod validation.

## Architecture

- **Modular monolith** — each feature has its own NestJS module in `src/modules/`
- **Shared package** `@clinio/shared` — contains Zod schemas, types, ErrorCode enum, and UserRole
- **Global guards** — JwtAuthGuard + RolesGuard registered globally via `APP_GUARD`; public endpoints use `@Public()`
- **Global prefix** — all routes are prefixed with `/api`

## Module Structure

Each module in `src/modules/<name>/` follows this layout:

```
<name>/
├── <name>.entity.ts        # TypeORM entity
├── <name>.service.ts        # Business logic, injected Repository
├── <name>.controller.ts     # REST controller with Swagger decorators
├── <name>.module.ts         # NestJS module
├── dto/                     # Request/Response DTOs
├── mapper/                  # Entity → DTO mapping (e.g. UserMapper.ts)
└── __tests__/               # Jest unit tests (*.spec.ts)
```

After creating a module, register it in `src/app/app.module.ts` (imports) and add a barrel export to `src/modules/index.ts`.

## Entity

- `@PrimaryGeneratedColumn("uuid")` for IDs
- Non-nullable properties with `!` (definite assignment assertion)
- Enum columns: `@Column({ type: "enum", enum: Object.values(MyEnum) })`
- Class name: `<Name>Entity` (e.g. `UserEntity`)
- Table name: lowercase plural in `@Entity("users")`

## Service

- `@Injectable()` decorator
- Repository injected via `@InjectRepository(Entity)`
- Async/await throughout
- Throw errors using helpers from `src/common/error-messages.ts` (`notFound()`, `internalError()`, `emailAlreadyExists()`, etc.)
- ErrorCode enum lives in `@clinio/shared`
- Hash passwords with `bcryptjs`, salt rounds 10

## Controller

- `@Controller("<resource>")` — lowercase plural (e.g. `"users"`)
- `@ApiTags("<Name>")` for Swagger grouping
- Every endpoint needs `@ApiOperation({ operationId: "<name>" })` — required for codegen
- Response types via `@ApiOkResponse({ type: ResponseDto })` etc.
- Validation via `@UsePipes(new ZodValidationPipe(schema))` — schema from `@clinio/shared`
- Validate UUID params with `@Param("id", ParseUUIDPipe)`
- Always map entities to DTOs via Mapper before returning — never return entities directly (they contain passwords etc.)
- Mark public routes with `@Public()`

## DTO

- **Request DTOs**: extend `createZodDto(schema)` from `nestjs-zod`, schemas defined in `@clinio/shared`
- **Response DTOs**: classes with `@ApiProperty()` decorators for Swagger
- Never include sensitive data (passwords) in response DTOs

## Mapper

- Static class (e.g. `UserMapper`) with `toDto()` and `toDtoList()` methods
- File named in PascalCase: `<Name>Mapper.ts` inside `mapper/` directory

## Error Handling

All API errors use a consistent response format defined as `ApiError` in `@clinio/shared`:

```typescript
interface ApiError {
  errorCode: ErrorCode;
  message: string;
}
```

Frontend can import `ApiError` and `ErrorCode` from `@clinio/shared`.

### ErrorCode Enum

Defined in `packages/shared/src/errors/error-code.ts`. Current values:

| ErrorCode               | HTTP Status | Usage                           |
| ----------------------- | ----------- | ------------------------------- |
| `INTERNAL_SERVER_ERROR` | 500         | Unexpected server errors        |
| `INVALID_CREDENTIALS`   | 401         | Wrong email/password at login   |
| `UNAUTHORIZED`          | 401         | Missing or invalid JWT          |
| `FORBIDDEN`             | 403         | Insufficient role/permissions   |
| `NOT_FOUND`             | 404         | Generic entity not found        |
| `USER_NOT_FOUND`        | 404         | Specific: user not found        |
| `OFFICE_NOT_FOUND`      | 404         | Specific: office not found      |
| `EMAIL_ALREADY_EXISTS`  | 409         | Duplicate email on registration |
| `BAD_REQUEST`           | 400         | Validation / missing params     |

### Error Helper Functions

Use helpers from `src/common/error-messages.ts` — never throw raw NestJS exceptions:

- `badRequest(message)` → `BadRequestException` with `BAD_REQUEST`
- `notFound(entity, errorCode?)` → `NotFoundException` with given or `NOT_FOUND` code
- `internalError()` → `InternalServerErrorException`
- `invalidCredentials()` → `UnauthorizedException`
- `unauthorized()` → `UnauthorizedException`
- `emailAlreadyExists()` → `ConflictException`
- `forbidden()` → `ForbiddenException`

### Adding a New Error

1. Add the new code to `ErrorCode` enum in `packages/shared/src/errors/error-code.ts`
2. Add a helper function in `src/common/error-messages.ts` that returns the appropriate NestJS exception with `{ errorCode, message }`
3. Use the helper in service/controller code

## Authorization

- All routes require JWT Bearer token (global guard)
- Public routes: `@Public()` decorator
- Role-based access: `@Roles(UserRole.ADMIN, UserRole.DOCTOR)` decorator
- Current user: `@CurrentUser()` decorator → returns `{ id, email, role }`

## Testing

- Location: `__tests__/<name>.<type>.spec.ts` (e.g. `__tests__/user.service.spec.ts`)
- `Test.createTestingModule()` for setup
- Mock repositories via `{ provide: getRepositoryToken(Entity), useFactory: () => ({ find: jest.fn(), ... }) }`
- Test both success and error cases
- Verify errorCode on error cases via `getResponse()`
- Run with `pnpm nx test server`

## Configuration

- `ConfigModule` is global — access via `ConfigService` injection
- Config values: `configService.get("database.host")` or `configService.getOrThrow("jwt.secret")`
- Env variables: `PORT`, `CLIENT_URL`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`

## Naming Conventions

| Type             | Format                 | Example                |
| ---------------- | ---------------------- | ---------------------- |
| Entity file      | `<name>.entity.ts`     | `user.entity.ts`       |
| Service file     | `<name>.service.ts`    | `user.service.ts`      |
| Controller file  | `<name>.controller.ts` | `user.controller.ts`   |
| Module file      | `<name>.module.ts`     | `user.module.ts`       |
| DTO file         | `<name>.dto.ts`        | `create-user.dto.ts`   |
| Mapper file      | `<Name>Mapper.ts`      | `UserMapper.ts`        |
| Entity class     | `<Name>Entity`         | `UserEntity`           |
| Service class    | `<Name>Service`        | `UserService`          |
| Controller class | `<Name>Controller`     | `UserController`       |
| URL resource     | lowercase plural       | `"users"`, `"offices"` |

## Imports

- Shared types/schemas: `import { ... } from "@clinio/shared"`
- Within a module: relative imports
- Module barrel exports: `src/modules/index.ts`
