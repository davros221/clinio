---
name: new-error
description: Add a new error code — shared ErrorCode enum + error helper function in error-messages.ts
argument-hint: <ERROR_CODE_NAME>
---

Add a new error code `$ARGUMENTS` to the project. This involves changes in two places.

## Steps

### 1. Add to shared ErrorCode enum

File: `packages/shared/src/errors/error-code.ts`

Add the new value to the `ErrorCode` enum:

```typescript
export enum ErrorCode {
  // ... existing codes
  $ARGUMENTS = "$ARGUMENTS",
}
```

### 2. Add helper function to error-messages.ts

File: `apps/server/src/common/error-messages.ts`

Add a new exported function that returns the appropriate NestJS exception. Follow the existing pattern:

```typescript
export function myNewError(): SomeException {
  return new SomeException({
    errorCode: ErrorCode.$ARGUMENTS,
    message: "Human-readable message",
  });
}
```

Choose the right NestJS exception class based on the error type:

- `NotFoundException` — resource not found (404)
- `UnauthorizedException` — auth failure (401)
- `ForbiddenException` — insufficient permissions (403)
- `ConflictException` — duplicate/conflict (409)
- `BadRequestException` — invalid input (400)
- `InternalServerErrorException` — unexpected server error (500)

### 3. Naming conventions

- ErrorCode enum value: `SCREAMING_SNAKE_CASE` (e.g. `APPOINTMENT_NOT_FOUND`)
- Helper function: `camelCase` (e.g. `appointmentNotFound()`)
- Message: human-readable, no technical details exposed to client
- For "not found" errors, use the generic `notFound(entity, code)` helper if it fits — only create a new function for errors that need custom logic

## Existing error helpers for reference

```typescript
internalError()                    → InternalServerErrorException
notFound(entity, code?)            → NotFoundException          // Generic, reusable
invalidCredentials()               → UnauthorizedException
unauthorized()                     → UnauthorizedException
emailAlreadyExists()               → ConflictException
forbidden()                        → ForbiddenException
```

## When to use `notFound()` vs a new helper

- **Use `notFound("Office", ErrorCode.OFFICE_NOT_FOUND)`** — when you just need a standard "X not found" message. Only add the ErrorCode to the enum, no new helper needed.
- **Create a new helper** — when the error needs a custom message, takes additional parameters, or doesn't fit the `notFound` pattern.
