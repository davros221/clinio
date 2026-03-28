# Error Handling

## Error Response Format

All API errors use a consistent response format defined as `ApiError` in `@clinio/shared`:

```typescript
interface ApiError {
  errorCode: ErrorCode;
  message: string;
}
```

Frontend can import `ApiError` and `ErrorCode` from `@clinio/shared`.

## ErrorCode Enum

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

## Error Helper Functions

Located in `src/common/error-messages.ts`. Always use these instead of throwing raw NestJS exceptions:

- `badRequest(message)` → `BadRequestException` with `BAD_REQUEST`
- `notFound(entity, errorCode?)` → `NotFoundException` with given or `NOT_FOUND` code
- `internalError()` → `InternalServerErrorException`
- `invalidCredentials()` → `UnauthorizedException`
- `unauthorized()` → `UnauthorizedException`
- `emailAlreadyExists()` → `ConflictException`
- `forbidden()` → `ForbiddenException`

## Adding a New Error

1. Add the new code to `ErrorCode` enum in `packages/shared/src/errors/error-code.ts`
2. Add a helper function in `src/common/error-messages.ts` that returns the appropriate NestJS exception with `{ errorCode, message }`
3. Use the helper in service/controller code — never throw raw exceptions
