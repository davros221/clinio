## Service Reference

```typescript
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ErrorCode } from "@clinio/shared";
import { UserEntity } from "./user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { internalError, notFound } from "../../common/error-messages";

@Injectable()
export class UserService {
  constructor(@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>) {}

  findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async findById(id: string): Promise<UserEntity> {
    let user: UserEntity | null;

    try {
      user = await this.userRepository.findOneBy({ id });
    } catch {
      throw internalError();
    }

    if (!user) {
      throw notFound("User", ErrorCode.USER_NOT_FOUND);
    }

    return user;
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const newEntity = this.userRepository.create(dto);
    return this.userRepository.save(newEntity);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
```

### Rules

- `@Injectable()` decorator
- Repository injected via `@InjectRepository(Entity)`
- Error helpers from `src/common/error-messages.ts`
- `findById` wraps DB call in try/catch → `internalError()` on failure, `notFound()` on null
- Return `Promise<Entity>` or `Promise<Entity[]>`
