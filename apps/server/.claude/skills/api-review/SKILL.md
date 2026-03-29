---
name: api-review
description: Review controller API consistency — Swagger decorators, operationIds, mapper usage, error responses, and conventions
argument-hint: [module-name or file path]
---

Review the API layer of the specified module (or all modules if no argument given) for consistency and completeness. If `$ARGUMENTS` is provided, review only that module/file.

## What to check

### 1. Swagger decorators

- Every endpoint has `@ApiOperation({ operationId: "..." })` — this is required for codegen
- Every endpoint has appropriate response decorators (`@ApiOkResponse`, `@ApiCreatedResponse`, `@ApiNotFoundResponse`, `@ApiBadRequestResponse`, `@ApiInternalServerErrorResponse`)
- Response decorators include `{ type: DtoClass }` or `{ description: "..." }`
- Controller has `@ApiTags("Name")`
- POST/PUT/PATCH endpoints with body validation have `@ApiBadRequestResponse`
- Endpoints that call `findById`-style service methods have `@ApiNotFoundResponse`

### 2. operationId consistency

- operationIds should be unique across all controllers
- Follow a consistent naming pattern (e.g. `get`, `getById`, `create`, `update`, `delete`)

### 3. Mapper usage

- Controllers NEVER return entities directly — always use `Mapper.toDto()` / `Mapper.toDtoList()`
- Response DTOs do NOT contain sensitive fields (password, tokens, internal IDs)

### 4. Validation

- POST/PUT/PATCH with body use `@UsePipes(new ZodValidationPipe(schema))`
- UUID path params use `@Param("id", ParseUUIDPipe)`
- Request DTO extends `createZodDto(schema)`

### 5. Auth decorators

- Public endpoints are explicitly marked with `@Public()`
- Role-restricted endpoints use `@Roles(...)` decorator
- Endpoints accessing current user use `@CurrentUser()` decorator

### 6. Error handling in services

- Services use error helpers from `src/common/error-messages.ts`
- Error codes from `@clinio/shared` ErrorCode enum
- No raw `throw new NotFoundException(...)` — use `notFound()` helper instead
- All ErrorCode values used in services actually exist in the shared enum

### 7. Naming conventions

- Controller resource: lowercase plural (`@Controller("offices")`)
- DTO files: `<name>.dto.ts`, `create-<name>.dto.ts`
- Mapper files: `<Name>Mapper.ts` in `mapper/` directory

## Output format

For each issue found, report:

- **File and line** where the issue is
- **Issue** — what's wrong
- **Fix** — what should be done

Group issues by severity:

1. **Errors** — will break codegen, missing validation, security issues (exposed sensitive data)
2. **Warnings** — missing Swagger decorators, inconsistent naming
3. **Suggestions** — minor improvements

If no issues are found, confirm the module follows all conventions.
