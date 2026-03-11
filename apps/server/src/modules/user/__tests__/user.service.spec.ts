import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { UserService } from "../user.service";
import { UserEntity } from "../user.entity";
import { UserRole, ErrorCode } from "@clinio/shared";
import { CreateUserDto } from "../dto/create-user.dto";

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
    it("should return all users", async () => {
      repository.find.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toEqual([mockUser]);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe("findById", () => {
    it("should return user when found", async () => {
      repository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockUser.id });
    });

    it("should throw NotFoundException when user not found", async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findById("non-existent-id")).rejects.toThrow(
        NotFoundException
      );
    });

    it("should throw NotFoundException with USER_NOT_FOUND error code", async () => {
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

  describe("findByEmail", () => {
    it("should return user when email exists", async () => {
      repository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(repository.findOneBy).toHaveBeenCalledWith({
        email: mockUser.email,
      });
    });

    it("should return null when email does not exist", async () => {
      repository.findOneBy.mockResolvedValue(null);

      const result = await service.findByEmail("unknown@example.com");

      expect(result).toBeNull();
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

    it("should hash the password before saving", async () => {
      const hashSpy = jest.spyOn(bcrypt, "hash") as jest.Mock;
      hashSpy.mockResolvedValue("bcrypt-hashed");
      repository.create.mockReturnValue({
        ...createDto,
        id: "new-id",
        password: "bcrypt-hashed",
      } as UserEntity);
      repository.save.mockResolvedValue({
        ...createDto,
        id: "new-id",
        password: "bcrypt-hashed",
      } as UserEntity);

      await service.create(createDto);

      expect(hashSpy).toHaveBeenCalledWith(createDto.password, 10);
      hashSpy.mockRestore();
    });

    it("should not store the plaintext password", async () => {
      const hashSpy = jest.spyOn(bcrypt, "hash") as jest.Mock;
      hashSpy.mockResolvedValue("bcrypt-hashed");
      repository.create.mockImplementation((data) => data as UserEntity);
      repository.save.mockImplementation((entity) =>
        Promise.resolve({ ...entity, id: "new-id" } as UserEntity)
      );

      await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: "bcrypt-hashed" })
      );
      expect(repository.create).not.toHaveBeenCalledWith(
        expect.objectContaining({ password: createDto.password })
      );
      hashSpy.mockRestore();
    });

    it("should return the saved entity", async () => {
      const saved = {
        ...createDto,
        id: "new-id",
        password: "hashed",
      } as UserEntity;
      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve("hashed"));
      repository.create.mockReturnValue(saved);
      repository.save.mockResolvedValue(saved);

      const result = await service.create(createDto);

      expect(result).toEqual(saved);
    });
  });

  describe("remove", () => {
    it("should call repository.delete with the id", async () => {
      repository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await service.remove(mockUser.id);

      expect(repository.delete).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
