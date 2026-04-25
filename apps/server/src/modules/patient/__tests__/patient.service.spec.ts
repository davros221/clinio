import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ForbiddenException } from "@nestjs/common";
import { Repository } from "typeorm";
import { PatientService } from "../patient.service";
import { PatientEntity } from "../patient.entity";
import { PatientSortField, SortOrder, UserRole } from "@clinio/shared";
import { UpdatePatientDto } from "../dto/update-patient.dto";
import { UserEntity } from "../../user/user.entity";
import { AuthUser } from "../../../auth/strategies/jwt.strategy";

const mockUser: UserEntity = {
  id: "user-uuid-0001",
  email: "jan.novak@example.com",
  password: null,
  firstName: "Jan",
  lastName: "Novák",
  role: UserRole.CLIENT,
};

const mockPatient: PatientEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  userId: mockUser.id,
  user: mockUser,
  birthNumber: "900101/1234",
  birthdate: new Date("1990-01-01"),
  phone: "+420123456789",
};

const clientUser: AuthUser = {
  id: mockUser.id,
  email: mockUser.email,
  role: UserRole.CLIENT,
};

const otherClientUser: AuthUser = {
  id: "other-user-uuid",
  email: "other@example.com",
  role: UserRole.CLIENT,
};

const doctorUser: AuthUser = {
  id: "doctor-uuid-0001",
  email: "doctor@example.com",
  role: UserRole.DOCTOR,
};

const createMockQueryBuilder = (result: [PatientEntity[], number]) => ({
  innerJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue(result),
});

describe("PatientService", () => {
  let service: PatientService;
  let repository: jest.Mocked<Repository<PatientEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: getRepositoryToken(PatientEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PatientService>(PatientService);
    repository = module.get(getRepositoryToken(PatientEntity));
  });

  describe("findAll", () => {
    const defaultQuery = {
      page: 1,
      limit: 20,
      sortBy: PatientSortField.LAST_NAME,
      sortOrder: SortOrder.ASC as SortOrder,
    };

    it("should return patients with pagination", async () => {
      const mockQb = createMockQueryBuilder([[mockPatient], 1]);
      repository.createQueryBuilder.mockReturnValue(mockQb as never);

      const result = await service.findAll(defaultQuery);

      expect(result).toEqual({ items: [mockPatient], total: 1 });
      expect(mockQb.innerJoinAndSelect).toHaveBeenCalledWith(
        "patient.user",
        "user"
      );
      expect(mockQb.orderBy).toHaveBeenCalledWith("user.lastName", "ASC");
      expect(mockQb.skip).toHaveBeenCalledWith(0);
      expect(mockQb.take).toHaveBeenCalledWith(20);
    });

    it("should apply search filter on user firstName and lastName", async () => {
      const mockQb = createMockQueryBuilder([[], 0]);
      repository.createQueryBuilder.mockReturnValue(mockQb as never);

      await service.findAll(defaultQuery, "Jan");

      expect(mockQb.where).toHaveBeenCalledWith(
        "user.firstName ILIKE :search OR user.lastName ILIKE :search",
        { search: "%Jan%" }
      );
    });

    it("should not apply search filter when search is undefined", async () => {
      const mockQb = createMockQueryBuilder([[], 0]);
      repository.createQueryBuilder.mockReturnValue(mockQb as never);

      await service.findAll(defaultQuery);

      expect(mockQb.where).not.toHaveBeenCalled();
    });

    it("should sort by patient column for non-lastName fields", async () => {
      const mockQb = createMockQueryBuilder([[], 0]);
      repository.createQueryBuilder.mockReturnValue(mockQb as never);

      await service.findAll({
        ...defaultQuery,
        sortBy: PatientSortField.BIRTHDATE,
        sortOrder: SortOrder.DESC,
      });

      expect(mockQb.orderBy).toHaveBeenCalledWith("patient.birthdate", "DESC");
    });

    it("should apply correct skip for page 2", async () => {
      const mockQb = createMockQueryBuilder([[], 0]);
      repository.createQueryBuilder.mockReturnValue(mockQb as never);

      await service.findAll({ ...defaultQuery, page: 2 });

      expect(mockQb.skip).toHaveBeenCalledWith(20);
    });
  });

  describe("findById", () => {
    it("should return a patient if found", async () => {
      repository.findOne.mockResolvedValue(mockPatient);
      const result = await service.findById(mockPatient.id);
      expect(result).toEqual(mockPatient);
    });

    it("should throw notFound error if patient does not exist", async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.findById("none")).rejects.toThrow();
    });

    it("should allow staff to access any patient", async () => {
      repository.findOne.mockResolvedValue(mockPatient);
      const result = await service.findById(mockPatient.id, doctorUser);
      expect(result).toEqual(mockPatient);
    });

    it("should allow client to access own patient record", async () => {
      repository.findOne.mockResolvedValue(mockPatient);
      const result = await service.findById(mockPatient.id, clientUser);
      expect(result).toEqual(mockPatient);
    });

    it("should forbid client from accessing another patient record", async () => {
      repository.findOne.mockResolvedValue(mockPatient);
      await expect(
        service.findById(mockPatient.id, otherClientUser)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("update", () => {
    it("should update partial fields and save the patient", async () => {
      const updateDto: UpdatePatientDto = { phone: "+420999888777" };
      const updatedPatient: PatientEntity = { ...mockPatient, ...updateDto };

      repository.findOne.mockResolvedValue(mockPatient);
      repository.save.mockResolvedValue(updatedPatient);

      const result = await service.update(
        mockPatient.id,
        updateDto,
        doctorUser
      );

      expect(result).toEqual(updatedPatient);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ phone: "+420999888777" })
      );
    });

    it("should allow client to update own patient record", async () => {
      const updateDto: UpdatePatientDto = { phone: "+420999888777" };
      const updatedPatient: PatientEntity = { ...mockPatient, ...updateDto };

      repository.findOne.mockResolvedValue(mockPatient);
      repository.save.mockResolvedValue(updatedPatient);

      const result = await service.update(
        mockPatient.id,
        updateDto,
        clientUser
      );
      expect(result).toEqual(updatedPatient);
    });

    it("should forbid client from updating another patient record", async () => {
      repository.findOne.mockResolvedValue(mockPatient);
      await expect(
        service.update(mockPatient.id, { phone: "+420111" }, otherClientUser)
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw an error if updating a non-existent patient", async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.update("none", {}, doctorUser)).rejects.toThrow();
    });
  });

  describe("delete", () => {
    it("should remove the patient if authorized", async () => {
      // Mock findOne to return the patient (simulating findById success)
      repository.findOne.mockResolvedValue(mockPatient);
      repository.remove.mockResolvedValue(mockPatient);

      await service.delete(mockPatient.id, doctorUser);

      expect(repository.remove).toHaveBeenCalledWith(mockPatient);
    });

    it("should forbid client from deleting own patient record", async () => {
      // We don't even need to mock findOne because it should throw before getting there
      await expect(service.delete(mockPatient.id, clientUser)).rejects.toThrow(
        ForbiddenException
      );
      expect(repository.remove).not.toHaveBeenCalled();
    });

    it("should forbid client from deleting another patient record", async () => {
      repository.findOne.mockResolvedValue(mockPatient);

      await expect(
        service.delete(mockPatient.id, otherClientUser)
      ).rejects.toThrow(ForbiddenException);
      expect(repository.remove).not.toHaveBeenCalled();
    });

    it("should throw an error if deleting a non-existent patient", async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.delete("none", doctorUser)).rejects.toThrow();
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
