## DTO Reference

### Request DTO (create-user.dto.ts)

```typescript
import { createUserSchema } from "@clinio/shared";
import { createZodDto } from "nestjs-zod";

export class CreateUserDto extends createZodDto(createUserSchema) {}
```

### Response DTO (user.dto.ts)

```typescript
import { ApiProperty } from "@nestjs/swagger";

export class User {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;
}
```

### Rules

- Request DTOs extend `createZodDto(schema)` from `nestjs-zod`
- Zod schemas live in `@clinio/shared` when reused by frontend
- Response DTOs use `@ApiProperty()` for Swagger generation
- Never include sensitive fields (passwords, tokens) in response DTOs
- Use `!` for non-nullable properties
