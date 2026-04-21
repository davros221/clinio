import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { UserService } from "../user.service";
import { UserEntity } from "../user.entity";
import { PatientEntity } from "../../patient/patient.entity";
import { UserRole, ErrorCode, UserSortField, SortOrder } from "@clinio/shared";
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
  findAndCount: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockTransactionManager = {
  create: jest.fn(),
  save: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn(
    (cb: (manager: typeof mockTransactionManager) => Promise<unknown>) =>
      cb(mockTransactionManager)
  ),
};

describe("UserService", () => {
  let service: UserService;
  let repository: jest.Mocked<
    Pick<
      Repository<UserEntity>,
      "find" | "findAndCount" | "findOneBy" | "create" | "save" | "delete"
    >
  >;
  beforeEach(async () => {
    mockTransactionManager.create.mockReset();
    mockTransactionManager.save.mockReset();
    (mockDataSource.transaction as jest.Mock).mockImplementation(
      (cb: (manager: typeof mockTransactionManager) => Promise<unknown>) =>
        cb(mockTransactionManager)
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useFactory: mockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
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

    const defaultQuery = {
      page: 1,
      limit: 20,
      sortBy: UserSortField.LAST_NAME,
      sortOrder: SortOrder.ASC,
    };

    it("should return users filtered by role with pagination", async () => {
      repository.findAndCount.mockResolvedValue([[mockUser], 1]);

      const result = await service.findAll(
        adminUser,
        [UserRole.DOCTOR],
        defaultQuery
      );

      expect(result).toEqual({ items: [mockUser], total: 1 });
      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { role: expect.anything() },
        order: { lastName: "ASC" },
        skip: 0,
        take: 20,
      });
    });

    it("should apply correct skip for page 2", async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(adminUser, [UserRole.DOCTOR], {
        ...defaultQuery,
        page: 2,
      });

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 20 })
      );
    });

    it("should apply sorting parameters", async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(adminUser, [UserRole.DOCTOR], {
        ...defaultQuery,
        sortBy: UserSortField.EMAIL,
        sortOrder: SortOrder.DESC,
      });

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ order: { email: "DESC" } })
      );
    });

    it("should allow admin to request ADMIN, DOCTOR, NURSE roles", async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      await expect(
        service.findAll(adminUser, [UserRole.ADMIN], defaultQuery)
      ).resolves.toBeDefined();
      await expect(
        service.findAll(adminUser, [UserRole.DOCTOR], defaultQuery)
      ).resolves.toBeDefined();
      await expect(
        service.findAll(adminUser, [UserRole.NURSE], defaultQuery)
      ).resolves.toBeDefined();
    });

    it("should forbid non-admin from requesting ADMIN role", async () => {
      await expect(
        service.findAll(doctorUser, [UserRole.ADMIN], defaultQuery)
      ).rejects.toThrow(ForbiddenException);
    });

    it("should forbid non-admin from requesting DOCTOR role", async () => {
      await expect(
        service.findAll(nurseUser, [UserRole.DOCTOR], defaultQuery)
      ).rejects.toThrow(ForbiddenException);
    });

    it("should forbid admin from requesting CLIENT role", async () => {
      await expect(
        service.findAll(adminUser, [UserRole.CLIENT], defaultQuery)
      ).rejects.toThrow(ForbiddenException);
    });

    it("should allow doctor to request CLIENT role", async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      await expect(
        service.findAll(doctorUser, [UserRole.CLIENT], defaultQuery)
      ).resolves.toBeDefined();
    });

    it("should allow nurse to request CLIENT role", async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      await expect(
        service.findAll(nurseUser, [UserRole.CLIENT], defaultQuery)
      ).resolves.toBeDefined();
    });

    it("should forbid client from requesting CLIENT role", async () => {
      await expect(
        service.findAll(clientUser, [UserRole.CLIENT], defaultQuery)
      ).rejects.toThrow(ForbiddenException);
    });

    it("should filter by search term on firstName and lastName", async () => {
      repository.findAndCount.mockResolvedValue([[mockUser], 1]);

      const result = await service.findAll(
        doctorUser,
        [UserRole.CLIENT],
        defaultQuery,
        "John"
      );

      expect(result).toEqual({ items: [mockUser], total: 1 });
      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: [
            { role: expect.anything(), firstName: expect.anything() },
            { role: expect.anything(), lastName: expect.anything() },
          ],
        })
      );
    });

    it("should not apply search filter when search is undefined", async () => {
      repository.findAndCount.mockResolvedValue([[mockUser], 1]);

      await service.findAll(adminUser, [UserRole.DOCTOR], defaultQuery);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { role: expect.anything() },
        })
      );
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

    it("should allow CLIENT to read own record", async () => {
      const clientEntity: UserEntity = {
        ...mockUser,
        id: "client-id",
        role: UserRole.CLIENT,
      };
      const clientAuth: AuthUser = {
        id: "client-id",
        email: clientEntity.email,
        role: UserRole.CLIENT,
      };
      repository.findOneBy.mockResolvedValue(clientEntity);

      await expect(service.findById("client-id", clientAuth)).resolves.toEqual(
        clientEntity
      );
    });

    it("should forbid CLIENT from reading another user's record", async () => {
      const clientAuth: AuthUser = {
        id: "client-id",
        email: "client@example.com",
        role: UserRole.CLIENT,
      };
      repository.findOneBy.mockResolvedValue(mockUser);

      await expect(service.findById(mockUser.id, clientAuth)).rejects.toThrow(
        ForbiddenException
      );
    });

    it("should allow DOCTOR to read any user's record", async () => {
      const doctorAuth: AuthUser = {
        id: "doctor-id",
        email: "doctor@example.com",
        role: UserRole.DOCTOR,
      };
      repository.findOneBy.mockResolvedValue(mockUser);

      await expect(service.findById(mockUser.id, doctorAuth)).resolves.toEqual(
        mockUser
      );
    });

    it("should allow ADMIN to read any user's record", async () => {
      const adminAuth: AuthUser = {
        id: "admin-id",
        email: "admin@example.com",
        role: UserRole.ADMIN,
      };
      repository.findOneBy.mockResolvedValue(mockUser);

      await expect(service.findById(mockUser.id, adminAuth)).resolves.toEqual(
        mockUser
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
      birthNumber: "900101/1234",
      birthdate: new Date("1990-01-01"),
      phone: "+420123456789",
    } as CreateUserDto;

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
      mockTransactionManager.create.mockReturnValue({
        ...clientDto,
        id: "new-id",
        password: "hashed",
      } as UserEntity);
      mockTransactionManager.save.mockResolvedValue({
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

    it("should forbid ADMIN from creating CLIENT", async () => {
      await expect(service.create(clientDto, adminUser)).rejects.toThrow(
        ForbiddenException
      );
    });

    it("should allow ADMIN to create DOCTOR", async () => {
      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve("hashed"));
      mockTransactionManager.create.mockReturnValue({
        ...doctorDto,
        id: "new-id",
        password: "hashed",
      } as UserEntity);
      mockTransactionManager.save.mockResolvedValue({
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
      mockTransactionManager.create.mockReturnValue({
        ...nurseDto,
        id: "new-id",
        password: "hashed",
      } as UserEntity);
      mockTransactionManager.save.mockResolvedValue({
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

    it("should require password when ADMIN creates DOCTOR", async () => {
      const doctorNoPassword: CreateUserDto = {
        email: "doc@example.com",
        firstName: "Doc",
        lastName: "Smith",
        role: UserRole.DOCTOR,
      } as CreateUserDto;

      await expect(service.create(doctorNoPassword, adminUser)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should allow DOCTOR to create CLIENT without password", async () => {
      const clientNoPassword: CreateUserDto = {
        email: "jane@example.com",
        firstName: "Jane",
        lastName: "Doe",
        role: UserRole.CLIENT,
        birthNumber: "900101/1234",
        birthdate: new Date("1990-01-01"),
        phone: "+420123456789",
      } as CreateUserDto;

      mockTransactionManager.create.mockReturnValue({
        ...clientNoPassword,
        id: "new-id",
        password: null,
      } as UserEntity);
      mockTransactionManager.save.mockResolvedValue({
        ...clientNoPassword,
        id: "new-id",
        password: null,
      } as UserEntity);

      await expect(
        service.create(clientNoPassword, doctorUser)
      ).resolves.toBeDefined();
    });

    it("should forbid DOCTOR from creating CLIENT with password", async () => {
      await expect(service.create(clientDto, doctorUser)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should forbid DOCTOR from creating DOCTOR", async () => {
      await expect(service.create(doctorDto, doctorUser)).rejects.toThrow(
        ForbiddenException
      );
    });

    // --- Existing behavior tests ---

    it("should create user without password when staff creates CLIENT", async () => {
      const passwordlessDto: CreateUserDto = {
        email: "jane@example.com",
        firstName: "Jane",
        lastName: "Doe",
        role: UserRole.CLIENT,
        birthNumber: "900101/1234",
        birthdate: new Date("1990-01-01"),
        phone: "+420123456789",
      } as CreateUserDto;

      mockTransactionManager.create.mockReturnValue({
        ...passwordlessDto,
        id: "new-id",
        password: null,
      } as UserEntity);
      mockTransactionManager.save.mockResolvedValue({
        ...passwordlessDto,
        id: "new-id",
        password: null,
      } as UserEntity);

      const result = await service.create(passwordlessDto, doctorUser);

      expect(result.password).toBeNull();
      expect(mockTransactionManager.create).toHaveBeenCalledWith(
        UserEntity,
        expect.objectContaining({ password: undefined })
      );
    });

    it("should require password for public self-registration", async () => {
      const noPasswordDto: CreateUserDto = {
        email: "jane@example.com",
        firstName: "Jane",
        lastName: "Doe",
        role: UserRole.CLIENT,
      } as CreateUserDto;

      await expect(service.create(noPasswordDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should hash the password before saving", async () => {
      const hashSpy = jest.spyOn(bcrypt, "hash") as jest.Mock;
      hashSpy.mockResolvedValue("bcrypt-hashed");
      mockTransactionManager.create.mockReturnValue({
        ...clientDto,
        id: "new-id",
        password: "bcrypt-hashed",
      } as UserEntity);
      mockTransactionManager.save.mockResolvedValue({
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
      mockTransactionManager.create.mockImplementation(
        (_entity, data) => data as UserEntity
      );
      mockTransactionManager.save.mockImplementation((entity) =>
        Promise.resolve({ ...entity, id: "new-id" } as UserEntity)
      );

      await service.create(clientDto);

      expect(mockTransactionManager.create).toHaveBeenCalledWith(
        UserEntity,
        expect.objectContaining({ password: "bcrypt-hashed" })
      );
      expect(mockTransactionManager.create).not.toHaveBeenCalledWith(
        UserEntity,
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
      mockTransactionManager.create.mockReturnValue(saved);
      mockTransactionManager.save.mockResolvedValue(saved);

      const result = await service.create(clientDto);

      expect(result).toEqual(saved);
    });

    it("should create patient entity when creating CLIENT user", async () => {
      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve("hashed"));
      const savedUser = {
        ...clientDto,
        id: "new-id",
        password: "hashed",
      } as UserEntity;
      mockTransactionManager.create.mockReturnValue(savedUser);
      mockTransactionManager.save.mockResolvedValue(savedUser);

      await service.create(clientDto);

      expect(mockTransactionManager.create).toHaveBeenCalledWith(
        PatientEntity,
        {
          userId: "new-id",
          birthNumber: clientDto.birthNumber,
          birthdate: clientDto.birthdate,
          phone: clientDto.phone,
        }
      );
      expect(mockTransactionManager.save).toHaveBeenCalledTimes(2);
    });

    it("should not create patient when creating DOCTOR user", async () => {
      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve("hashed"));
      mockTransactionManager.create.mockReturnValue({
        ...doctorDto,
        id: "new-id",
        password: "hashed",
      } as UserEntity);
      mockTransactionManager.save.mockResolvedValue({
        ...doctorDto,
        id: "new-id",
        password: "hashed",
      } as UserEntity);

      await service.create(doctorDto, adminUser);

      expect(mockTransactionManager.create).toHaveBeenCalledTimes(1);
      expect(mockTransactionManager.create).toHaveBeenCalledWith(
        UserEntity,
        expect.anything()
      );
    });

    it("should use transaction for user and patient creation", async () => {
      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve("hashed"));
      mockTransactionManager.create.mockReturnValue({
        ...clientDto,
        id: "new-id",
        password: "hashed",
      } as UserEntity);
      mockTransactionManager.save.mockResolvedValue({
        ...clientDto,
        id: "new-id",
        password: "hashed",
      } as UserEntity);

      await service.create(clientDto);

      expect(mockDataSource.transaction).toHaveBeenCalled();
    });

    it("should throw ConflictException when email already exists", async () => {
      repository.findOneBy.mockResolvedValue(mockUser);

      await expect(service.create(clientDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe("remove", () => {
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

    it("should allow admin to delete another user", async () => {
      repository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await service.remove("other-user-id", adminUser);

      expect(repository.delete).toHaveBeenCalledWith("other-user-id");
    });

    it("should forbid admin from deleting own account", async () => {
      await expect(service.remove(adminUser.id, adminUser)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should allow non-admin to delete own account", async () => {
      repository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await service.remove(doctorUser.id, doctorUser);

      expect(repository.delete).toHaveBeenCalledWith(doctorUser.id);
    });

    it("should forbid non-admin from deleting another user", async () => {
      await expect(service.remove("other-user-id", doctorUser)).rejects.toThrow(
        ForbiddenException
      );
    });
  });
});
