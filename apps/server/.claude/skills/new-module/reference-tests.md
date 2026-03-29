## Testing Reference

### Service test (**tests**/user.service.spec.ts)

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { UserService } from "../user.service";
import { UserEntity } from "../user.entity";
import { UserRole, ErrorCode } from "@clinio/shared";

const mockUser: UserEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "john@example.com",
  password: "hashed-password",
  firstName: "John",
  lastName: "Doe",
  role: UserRole.DOCTOR,
};

const mockRepository = () => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe("UserService", () => {
  let service: UserService;
  let repository: jest.Mocked<
    Pick<
      Repository<UserEntity>,
      "find" | "findOneBy" | "create" | "save" | "delete"
    >
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(getRepositoryToken(UserEntity));
  });

  describe("findAll", () => {
    it("should return all entities", async () => {
      repository.find.mockResolvedValue([mockUser]);
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe("findById", () => {
    it("should return entity when found", async () => {
      repository.findOneBy.mockResolvedValue(mockUser);
      const result = await service.findById(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it("should throw NotFoundException when not found", async () => {
      repository.findOneBy.mockResolvedValue(null);
      await expect(service.findById("non-existent-id")).rejects.toThrow(
        NotFoundException
      );
    });

    it("should throw NotFoundException with correct error code", async () => {
      repository.findOneBy.mockResolvedValue(null);
      try {
        await service.findById("non-existent-id");
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect((error as NotFoundException).getResponse()).toMatchObject({
          errorCode: ErrorCode.USER_NOT_FOUND,
        });
      }
    });

    it("should throw InternalServerErrorException when repository throws", async () => {
      repository.findOneBy.mockRejectedValue(new Error("DB error"));
      await expect(service.findById(mockUser.id)).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });
});
```

### Controller test (**tests**/user.controller.spec.ts)

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "../user.controller";
import { UserService } from "../user.service";
import { UserEntity } from "../user.entity";
import { UserMapper } from "../mapper/UserMapper";
import { UserRole } from "@clinio/shared";

const mockUser: UserEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "john@example.com",
  password: "hashed-password",
  firstName: "John",
  lastName: "Doe",
  role: UserRole.DOCTOR,
};

const mockUserDto = UserMapper.toDto(mockUser);

const mockUserService = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
});

describe("UserController", () => {
  let controller: UserController;
  let service: jest.Mocked<
    Pick<UserService, "findAll" | "findById" | "create" | "remove">
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useFactory: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get(UserService);
  });

  describe("getAll", () => {
    it("should return mapped DTOs", async () => {
      service.findAll.mockResolvedValue([mockUser]);
      const result = await controller.getAll();
      expect(result).toEqual([mockUserDto]);
    });
  });

  describe("getById", () => {
    it("should return mapped DTO", async () => {
      service.findById.mockResolvedValue(mockUser);
      const result = await controller.getById(mockUser.id);
      expect(result).toEqual(mockUserDto);
    });
  });
});
```

### Mapper test (**tests**/UserMapper.spec.ts)

```typescript
import { UserMapper } from "../mapper/UserMapper";
import { UserEntity } from "../user.entity";
import { UserRole } from "@clinio/shared";

const mockEntity: UserEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "john@example.com",
  password: "secret-hashed-password",
  firstName: "John",
  lastName: "Doe",
  role: UserRole.DOCTOR,
};

describe("UserMapper", () => {
  describe("toDto", () => {
    it("should map entity to DTO with correct fields", () => {
      const dto = UserMapper.toDto(mockEntity);
      expect(dto).toEqual({
        id: mockEntity.id,
        email: mockEntity.email,
        firstName: mockEntity.firstName,
        lastName: mockEntity.lastName,
      });
    });

    it("should NOT include password in DTO", () => {
      const dto = UserMapper.toDto(mockEntity);
      expect(dto).not.toHaveProperty("password");
    });
  });

  describe("toDtoList", () => {
    it("should map array of entities to DTOs", () => {
      const dtos = UserMapper.toDtoList([mockEntity]);
      expect(dtos).toHaveLength(1);
      expect(dtos[0]).toEqual(UserMapper.toDto(mockEntity));
    });

    it("should return empty array for empty input", () => {
      expect(UserMapper.toDtoList([])).toEqual([]);
    });
  });
});
```

### Rules

- Tests in `__tests__/` directory, named `<name>.<type>.spec.ts`
- Mock repository via `getRepositoryToken(Entity)` with `useFactory`
- Mock service via `{ provide: Service, useFactory: mockFn }`
- Mock data defined at top of file as `const mockEntity: Entity = { ... }`
- Test both success and error paths
- Verify error codes via `(error as Exception).getResponse()`
- Use `describe` blocks per method
