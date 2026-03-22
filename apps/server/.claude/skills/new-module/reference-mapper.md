## Mapper Reference

```typescript
import { User } from "../dto/user.dto";
import { UserEntity } from "../user.entity";

export class UserMapper {
  static toDto(user: UserEntity): User {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  static toDtoList(users: UserEntity[]): User[] {
    return users.map(this.toDto);
  }
}
```

### Rules

- Static class with `toDto()` and `toDtoList()` methods
- File name: `<Name>Mapper.ts` (PascalCase) in `mapper/` directory
- Explicitly map each field — do not spread entity
- Exclude sensitive fields (password, internal IDs, etc.)
