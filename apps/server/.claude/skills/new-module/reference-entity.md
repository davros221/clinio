## Entity Reference

```typescript
import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserRole } from "@clinio/shared";

@Entity("users")
@Unique(["email"])
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ type: "enum", enum: Object.values(UserRole) })
  role!: UserRole;
}
```

### Rules

- Class name: `<Name>Entity`
- Table name: lowercase plural in `@Entity("tablename")`
- Always use `@PrimaryGeneratedColumn("uuid")` for ID
- Non-nullable properties use `!` (definite assignment)
- Enum columns: `@Column({ type: "enum", enum: Object.values(MyEnum) })`
- Unique constraints via `@Unique(["field"])`
