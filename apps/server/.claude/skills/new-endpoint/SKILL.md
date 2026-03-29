---
name: new-endpoint
description: Add a new endpoint to an existing module — service method, controller endpoint, DTO, Swagger decorators, and tests
argument-hint: <module-name>
---

Add a new endpoint to the existing `$ARGUMENTS` module. Follow the project conventions from the reference files.

## Before generating

Ask the user:

1. **HTTP method and route** (e.g. `PATCH :id`, `GET /search`, `POST /`)
2. **What does it do?** (brief description of the business logic)
3. **Request body?** If yes — what fields? Does a Zod schema already exist in `@clinio/shared`?
4. **Response** — what fields should the response DTO contain? Or reuse existing DTO?
5. **Auth** — public (`@Public()`), role-restricted (`@Roles(...)`), or default (JWT required)?

## Steps

1. **Service method** — add the new method to `src/modules/$ARGUMENTS/$ARGUMENTS.service.ts`

   - Use repository methods (`find`, `findOneBy`, `save`, `update`, `delete`)
   - Error handling via helpers from `src/common/error-messages.ts`
   - If a new ErrorCode is needed, add it to `@clinio/shared` enum

2. **DTOs** (if needed)

   - Request DTO: `dto/create-$ARGUMENTS.dto.ts` or `dto/update-$ARGUMENTS.dto.ts` — extends `createZodDto(schema)`
   - Response DTO: `dto/$ARGUMENTS.dto.ts` — class with `@ApiProperty()` decorators
   - If a new Zod schema is needed for frontend reuse, create it in `@clinio/shared`

3. **Mapper** (if needed)

   - Add new mapping method to existing `mapper/<Name>Mapper.ts` if the response shape differs from existing DTOs

4. **Controller endpoint** — add to `src/modules/$ARGUMENTS/$ARGUMENTS.controller.ts`

   - `@ApiOperation({ operationId: "..." })` — unique operationId, required for codegen
   - Appropriate response decorators (`@ApiOkResponse`, `@ApiCreatedResponse`, etc.)
   - `@UsePipes(new ZodValidationPipe(schema))` for body validation
   - `@Param("id", ParseUUIDPipe)` for UUID params
   - Map entity to DTO via Mapper before returning
   - `@Public()` or `@Roles(...)` if needed

5. **Tests** — update existing test files

   - Add service method tests in `__tests__/$ARGUMENTS.service.spec.ts` (success + error cases)
   - Add controller method tests in `__tests__/$ARGUMENTS.controller.spec.ts`
   - Add mapper tests if new mapping method was created
   - Add mock method to existing mock factories if needed

6. **Verify** — run `pnpm nx test server` to confirm tests pass

## Reference

See the reference files in the `new-module` skill for code examples:

- `reference-service.md` — service patterns
- `reference-controller.md` — controller with Swagger decorators
- `reference-dto.md` — request/response DTO patterns
- `reference-mapper.md` — mapper patterns
- `reference-tests.md` — test patterns
