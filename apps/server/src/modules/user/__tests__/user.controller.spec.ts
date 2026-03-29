import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "../user.controller";
import { UserService } from "../user.service";
import { UserEntity } from "../user.entity";
import { UserMapper } from "../mapper/UserMapper";
import { UserRole } from "@clinio/shared";
import { CreateUserDto } from "../dto/create-user.dto";
import { AuthUser } from "../../../auth/strategies/jwt.strategy";

const mockUser: UserEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "john@example.com",
  password: "hashed-password",
  firstName: "John",
  lastName: "Doe",
  role: UserRole.DOCTOR,
};

const mockAdmin: AuthUser = {
  id: "admin-id",
  email: "admin@example.com",
  role: UserRole.ADMIN,
};

const mockUserDto = UserMapper.toDto(mockUser);

const mockUserService = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
});

describe("UserController", () => {
  let controller: UserController;
  let service: jest.Mocked<
    Pick<
      UserService,
      "findAll" | "findById" | "findByEmail" | "create" | "remove"
    >
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useFactory: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get(UserService);
  });

  describe("getAll", () => {
    it("should return mapped user DTOs", async () => {
      service.findAll.mockResolvedValue([mockUser]);

      const result = await controller.getAll(mockAdmin, [UserRole.DOCTOR]);

      expect(result).toEqual([mockUserDto]);
      expect(service.findAll).toHaveBeenCalledWith(mockAdmin, [
        UserRole.DOCTOR,
      ]);
    });

    it("should return empty array when no users exist", async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.getAll(mockAdmin, [UserRole.DOCTOR]);

      expect(result).toEqual([]);
    });

    it("should pass roles array to service", async () => {
      service.findAll.mockResolvedValue([]);

      await controller.getAll(mockAdmin, [UserRole.DOCTOR, UserRole.NURSE]);

      expect(service.findAll).toHaveBeenCalledWith(mockAdmin, [
        UserRole.DOCTOR,
        UserRole.NURSE,
      ]);
    });

    it("should normalize single role to array", async () => {
      service.findAll.mockResolvedValue([]);

      await controller.getAll(mockAdmin, UserRole.NURSE);

      expect(service.findAll).toHaveBeenCalledWith(mockAdmin, [UserRole.NURSE]);
    });

    it("should throw BadRequestException when role param is missing", async () => {
      await expect(controller.getAll(mockAdmin, undefined)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw BadRequestException for invalid role value", async () => {
      await expect(
        controller.getAll(mockAdmin, "INVALID" as UserRole)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getById", () => {
    it("should return mapped user DTO", async () => {
      service.findById.mockResolvedValue(mockUser);

      const result = await controller.getById(mockUser.id);

      expect(result).toEqual(mockUserDto);
      expect(service.findById).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe("create", () => {
    const createDto: CreateUserDto = {
      email: "jane@example.com",
      password: "StrongP@ss1",
      firstName: "Jane",
      lastName: "Doe",
      role: UserRole.CLIENT,
    };

    it("should create user and return mapped DTO", async () => {
      const created: UserEntity = {
        ...createDto,
        id: "new-id",
        password: "hashed",
      };
      service.create.mockResolvedValue(created);

      const result = await controller.create(createDto);

      expect(result).toEqual(UserMapper.toDto(created));
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe("delete", () => {
    it("should call service.remove with id", async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.delete(mockUser.id);

      expect(service.remove).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
