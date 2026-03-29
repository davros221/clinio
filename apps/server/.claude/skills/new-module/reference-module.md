## Module Reference

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserEntity } from "./user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

### Rules

- `TypeOrmModule.forFeature([Entity])` in imports
- Export service if other modules need it
- Class name: `<Name>Module`
- After creating, register in `src/app/app.module.ts` and add to `src/modules/index.ts`
