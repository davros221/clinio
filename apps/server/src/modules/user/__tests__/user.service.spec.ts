import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { UserService } from "../user.service";
import { UserEntity } from "../user.entity";
import { UserRole, ErrorCode } from "@clinio/shared";
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
    const adminUser: AuthUser = {
      id: "admin-id",
      email: "admin@example.com",
      role: UserRole.ADMIN,
    };
    const doctorUser: AuthUser = {
      id: "doctor-id",
      email: "doctor@example.com",
      role: UserRole.DOCTOR,
    };
    const nurseUser: AuthUser = {
      id: "nurse-id",
      email: "nurse@example.com",
      role: UserRole.NURSE,
    };
    const clientUser: AuthUser = {
      id: "client-id",
      email: "client@example.com",
      role: UserRole.CLIENT,
    };

    it("should return users filtered by role", async () => {
      repository.find.mockResolvedValue([mockUser]);

      const result = await service.findAll(adminUser, [UserRole.DOCTOR]);

      expect(result).toEqual([mockUser]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { role: expect.anything() },
      });
    });

    it("should allow admin to request ADMIN, DOCTOR, NURSE roles", async () => {
      repository.find.mockResolvedValue([]);

      await expect(
        service.findAll(adminUser, [UserRole.ADMIN])
      ).resolves.toBeDefined();
      await expect(
        service.findAll(adminUser, [UserRole.DOCTOR])
      ).resolves.toBeDefined();
      await expect(
        service.findAll(adminUser, [UserRole.NURSE])
      ).resolves.toBeDefined();
    });

    it("should forbid non-admin from requesting ADMIN role", async () => {
      await expect(
        service.findAll(doctorUser, [UserRole.ADMIN])
      ).rejects.toThrow(ForbiddenException);
    });

    it("should forbid non-admin from requesting DOCTOR role", async () => {
      await expect(
        service.findAll(nurseUser, [UserRole.DOCTOR])
      ).rejects.toThrow(ForbiddenException);
    });

    it("should forbid admin from requesting CLIENT role", async () => {
      await expect(
        service.findAll(adminUser, [UserRole.CLIENT])
      ).rejects.toThrow(ForbiddenException);
    });

    it("should allow doctor to request CLIENT role", async () => {
      repository.find.mockResolvedValue([]);

      await expect(
        service.findAll(doctorUser, [UserRole.CLIENT])
      ).resolves.toBeDefined();
    });

    it("should allow nurse to request CLIENT role", async () => {
      repository.find.mockResolvedValue([]);

      await expect(
        service.findAll(nurseUser, [UserRole.CLIENT])
      ).resolves.toBeDefined();
    });

    it("should forbid client from requesting CLIENT role", async () => {
      await expect(
        service.findAll(clientUser, [UserRole.CLIENT])
      ).rejects.toThrow(ForbiddenException);
    });

    it("should filter by search term on firstName and lastName", async () => {
      repository.find.mockResolvedValue([mockUser]);

      const result = await service.findAll(
        doctorUser,
        [UserRole.CLIENT],
        "John"
      );

      expect(result).toEqual([mockUser]);
      expect(repository.find).toHaveBeenCalledWith({
        where: [
          { role: expect.anything(), firstName: expect.anything() },
          { role: expect.anything(), lastName: expect.anything() },
        ],
      });
    });

    it("should not apply search filter when search is undefined", async () => {
      repository.find.mockResolvedValue([mockUser]);

      await service.findAll(adminUser, [UserRole.DOCTOR]);

      expect(repository.find).toHaveBeenCalledWith({
        where: { role: expect.anything() },
      });
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
    const adminUser: AuthUser = {
      id: "admin-id",
      email: "admin@example.com",
      role: UserRole.ADMIN,
    };
    const doctorUser: AuthUser = {
      id: "doctor-id",
      email: "doctor@example.com",
      role: UserRole.DOCTOR,
    };

    const clientDto: CreateUserDto = {
      email: "jane@example.com",
      password: "StrongP@ss1",
      firstName: "Jane",
      lastName: "Doe",
      role: UserRole.CLIENT,
    };

    const doctorDto: CreateUserDto = {
      ...clientDto,
      role: UserRole.DOCTOR,
    };

    const nurseDto: CreateUserDto = {
      ...clientDto,
      role: UserRole.NURSE,
    };

    const adminDto: CreateUserDto = {
      ...clientDto,
      role: UserRole.ADMIN,
    };

    // --- Role constraint tests ---

    it("should allow public (no auth) to create CLIENT", async () => {
      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve("hashed"));
      repository.create.mockReturnValue({
        ...clientDto,
        id: "new-id",
        password: "hashed",
      } as UserEntity);
      repository.save.mockResolvedValue({
        ...clientDto,
        id: "new-id",
        password: "hashed",
      } as UserEntity);

      await expect(service.create(clientDto)).resolves.toBeDefined();
    });

    it("should forbid public (no auth) from creating DOCTOR", async () => {
      await expect(service.create(doctorDto)).rejects.toThrow(
        ForbiddenException
      );
    });

    it("should forbid public (no auth) from creating NURSE", async () => {
      await expect(service.create(nurseDto)).rejects.toThrow(
        ForbiddenException
      );
    });

    it("should forbid public (no auth) from creating ADMIN", async () => {
      await expect(service.create(adminDto)).rejects.toThrow(
        ForbiddenException
      );
    });

    it("should allow ADMIN to create CLIENT", async () => {
      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve("hashed"));
      repository.create.mockReturnValue({
        ...clientDto,
        id: "new-id",
        password: "hashed",
      } as UserEntity);
      repository.save.mockResolvedValue({
        ...clientDto,
        id: "new-id",
        password: "hashed",
      } as UserEntity);

      await expect(service.create(clientDto, adminUser)).resolves.toBeDefined();
    });

    it("should allow ADMIN to create DOCTOR", async () => {
      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve("hashed"));
      repository.create.mockReturnValue({
        ...doctorDto,
        id: "new-id",
        password: "hashed",
      } as UserEntity);
      repository.save.mockResolvedValue({
        ...doctorDto,
        id: "new-id",
        password: "hashed",
      } as UserEntity);

      await expect(service.create(doctorDto, adminUser)).resolves.toBeDefined();
    });

    it("should allow ADMIN to create NURSE", async () => {
      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve("hashed"));
      repository.create.mockReturnValue({
        ...nurseDto,
        id: "new-id",
        password: "hashed",
      } as UserEntity);
      repository.save.mockResolvedValue({
        ...nurseDto,
        id: "new-id",
        password: "hashed",
      } as UserEntity);

      await expect(service.create(nurseDto, adminUser)).resolves.toBeDefined();
    });

    it("should forbid ADMIN from creating ADMIN", async () => {
      await expect(service.create(adminDto, adminUser)).rejects.toThrow(
        ForbiddenException
      );
    });

    it("should forbid non-ADMIN authenticated user from creating any role", async () => {
      await expect(service.create(clientDto, doctorUser)).rejects.toThrow(
        ForbiddenException
      );
      await expect(service.create(doctorDto, doctorUser)).rejects.toThrow(
        ForbiddenException
      );
    });

    // --- Existing behavior tests ---

    it("should hash the password before saving", async () => {
      const hashSpy = jest.spyOn(bcrypt, "hash") as jest.Mock;
      hashSpy.mockResolvedValue("bcrypt-hashed");
      repository.create.mockReturnValue({
        ...clientDto,
        id: "new-id",
        password: "bcrypt-hashed",
      } as UserEntity);
      repository.save.mockResolvedValue({
        ...clientDto,
        id: "new-id",
        password: "bcrypt-hashed",
      } as UserEntity);

      await service.create(clientDto);

      expect(hashSpy).toHaveBeenCalledWith(clientDto.password, 10);
      hashSpy.mockRestore();
    });

    it("should not store the plaintext password", async () => {
      const hashSpy = jest.spyOn(bcrypt, "hash") as jest.Mock;
      hashSpy.mockResolvedValue("bcrypt-hashed");
      repository.create.mockImplementation((data) => data as UserEntity);
      repository.save.mockImplementation((entity) =>
        Promise.resolve({ ...entity, id: "new-id" } as UserEntity)
      );

      await service.create(clientDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: "bcrypt-hashed" })
      );
      expect(repository.create).not.toHaveBeenCalledWith(
        expect.objectContaining({ password: clientDto.password })
      );
      hashSpy.mockRestore();
    });

    it("should return the saved entity", async () => {
      const saved = {
        ...clientDto,
        id: "new-id",
        password: "hashed",
      } as UserEntity;
      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve("hashed"));
      repository.create.mockReturnValue(saved);
      repository.save.mockResolvedValue(saved);

      const result = await service.create(clientDto);

      expect(result).toEqual(saved);
    });

    it("should throw ConflictException when email already exists", async () => {
      repository.findOneBy.mockResolvedValue(mockUser);

      await expect(service.create(clientDto)).rejects.toThrow(
        ConflictException
      );
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
