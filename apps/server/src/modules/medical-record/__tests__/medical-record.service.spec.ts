import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import {
  ErrorCode,
  MedicalRecordSortField,
  SortOrder,
  UserRole,
} from "@clinio/shared";
import { MedicalRecordService } from "../medical-record.service";
import { MedicalRecordEntity } from "../medical-record.entity";
import { PatientEntity } from "../../patient/patient.entity";
import { UserEntity } from "../../user/user.entity";
import { CreateMedicalRecordDto } from "../dto/create-medical-record.dto";
import { AuthUser } from "../../../auth/strategies/jwt.strategy";

const doctorUser: AuthUser = {
  id: "doctor-uuid-0001",
  email: "doctor@example.com",
  role: UserRole.DOCTOR,
};

const clientUser: AuthUser = {
  id: "user-uuid-0001",
  email: "jan.novak@example.com",
  role: UserRole.CLIENT,
};

const otherClientUser: AuthUser = {
  id: "user-uuid-0002",
  email: "other@example.com",
  role: UserRole.CLIENT,
};

const adminUser: AuthUser = {
  id: "admin-uuid-0001",
  email: "admin@example.com",
  role: UserRole.ADMIN,
};

const mockClientUserEntity: UserEntity = {
  id: clientUser.id,
  email: clientUser.email,
  password: null,
  firstName: "Jan",
  lastName: "Novák",
  role: UserRole.CLIENT,
};

const mockPatient: PatientEntity = {
  id: "patient-uuid-0001",
  userId: clientUser.id,
  user: mockClientUserEntity,
  birthNumber: "900101/1234",
  birthdate: new Date("1990-01-01"),
  phone: "+420123456789",
};

const mockCreator: UserEntity = {
  id: doctorUser.id,
  email: doctorUser.email,
  password: null,
  firstName: "Anna",
  lastName: "Lékařská",
  role: UserRole.DOCTOR,
};

const mockRecord: MedicalRecordEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  patientId: mockPatient.id,
  patient: mockPatient,
  createdBy: doctorUser.id,
  creator: mockCreator,
  createdAt: new Date("2026-04-01T10:00:00Z"),
  examinationSummary: "Standard checkup",
  diagnosis: "Healthy",
};

const defaultQuery = {
  page: 1,
  limit: 20,
  sortBy: MedicalRecordSortField.CREATED_AT,
  sortOrder: SortOrder.DESC,
};

const mockMedicalRecordRepository = () => ({
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockPatientRepository = () => ({
  findOne: jest.fn(),
});

describe("MedicalRecordService", () => {
  let service: MedicalRecordService;
  let recordRepo: jest.Mocked<
    Pick<
      Repository<MedicalRecordEntity>,
      "findOne" | "findAndCount" | "create" | "save"
    >
  >;
  let patientRepo: jest.Mocked<Pick<Repository<PatientEntity>, "findOne">>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordService,
        {
          provide: getRepositoryToken(MedicalRecordEntity),
          useFactory: mockMedicalRecordRepository,
        },
        {
          provide: getRepositoryToken(PatientEntity),
          useFactory: mockPatientRepository,
        },
      ],
    }).compile();

    service = module.get<MedicalRecordService>(MedicalRecordService);
    recordRepo = module.get(getRepositoryToken(MedicalRecordEntity));
    patientRepo = module.get(getRepositoryToken(PatientEntity));
  });

  describe("findAllForPatient", () => {
    it("should return records for the patient when called by staff", async () => {
      patientRepo.findOne.mockResolvedValue(mockPatient);
      recordRepo.findAndCount.mockResolvedValue([[mockRecord], 1]);

      const result = await service.findAllForPatient(
        mockPatient.id,
        defaultQuery,
        doctorUser
      );

      expect(result).toEqual({ items: [mockRecord], total: 1 });
      expect(recordRepo.findAndCount).toHaveBeenCalledWith({
        where: { patientId: mockPatient.id },
        relations: ["patient", "patient.user", "creator"],
        order: { createdAt: "DESC" },
        skip: 0,
        take: 20,
      });
    });

    it("should return own records for CLIENT", async () => {
      patientRepo.findOne.mockResolvedValue(mockPatient);
      recordRepo.findAndCount.mockResolvedValue([[mockRecord], 1]);

      const result = await service.findAllForPatient(
        mockPatient.id,
        defaultQuery,
        clientUser
      );

      expect(result).toEqual({ items: [mockRecord], total: 1 });
    });

    it("should throw ForbiddenException when CLIENT accesses other patient", async () => {
      patientRepo.findOne.mockResolvedValue(mockPatient);

      await expect(
        service.findAllForPatient(mockPatient.id, defaultQuery, otherClientUser)
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw NotFoundException when patient does not exist", async () => {
      patientRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findAllForPatient("missing", defaultQuery, doctorUser)
      ).rejects.toThrow(NotFoundException);
    });

    it("should forbid ADMIN from listing medical records", async () => {
      patientRepo.findOne.mockResolvedValue(mockPatient);

      await expect(
        service.findAllForPatient(mockPatient.id, defaultQuery, adminUser)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("findById", () => {
    it("should return record for staff", async () => {
      patientRepo.findOne.mockResolvedValue(mockPatient);
      recordRepo.findOne.mockResolvedValue(mockRecord);

      const result = await service.findById(
        mockPatient.id,
        mockRecord.id,
        doctorUser
      );

      expect(result).toEqual(mockRecord);
      expect(recordRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockRecord.id, patientId: mockPatient.id },
        relations: ["patient", "patient.user", "creator"],
      });
    });

    it("should return record for CLIENT who owns the patient", async () => {
      patientRepo.findOne.mockResolvedValue(mockPatient);
      recordRepo.findOne.mockResolvedValue(mockRecord);

      const result = await service.findById(
        mockPatient.id,
        mockRecord.id,
        clientUser
      );

      expect(result).toEqual(mockRecord);
    });

    it("should throw ForbiddenException when CLIENT is not the owning patient", async () => {
      patientRepo.findOne.mockResolvedValue(mockPatient);

      await expect(
        service.findById(mockPatient.id, mockRecord.id, otherClientUser)
      ).rejects.toThrow(ForbiddenException);
    });

    it("should forbid ADMIN from accessing medical records", async () => {
      patientRepo.findOne.mockResolvedValue(mockPatient);

      await expect(
        service.findById(mockPatient.id, mockRecord.id, adminUser)
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw NotFoundException when record does not belong to patient", async () => {
      patientRepo.findOne.mockResolvedValue(mockPatient);
      recordRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findById(mockPatient.id, "missing", doctorUser)
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException with MEDICAL_RECORD_NOT_FOUND error code", async () => {
      patientRepo.findOne.mockResolvedValue(mockPatient);
      recordRepo.findOne.mockResolvedValue(null);

      try {
        await service.findById(mockPatient.id, "missing", doctorUser);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect((error as NotFoundException).getResponse()).toMatchObject({
          errorCode: ErrorCode.MEDICAL_RECORD_NOT_FOUND,
        });
      }
    });

    it("should throw InternalServerErrorException when repository throws", async () => {
      patientRepo.findOne.mockResolvedValue(mockPatient);
      recordRepo.findOne.mockRejectedValue(new Error("DB error"));

      await expect(
        service.findById(mockPatient.id, mockRecord.id, doctorUser)
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe("create", () => {
    const createDto: CreateMedicalRecordDto = {
      examinationSummary: "Routine follow-up",
      diagnosis: "No issues",
    };

    it("should create a record with patientId from URL and stamp currentUser", async () => {
      patientRepo.findOne.mockResolvedValue(mockPatient);
      recordRepo.create.mockReturnValue(mockRecord);
      recordRepo.save.mockResolvedValue(mockRecord);
      recordRepo.findOne.mockResolvedValue(mockRecord);

      const result = await service.create(
        mockPatient.id,
        createDto,
        doctorUser
      );

      expect(result).toEqual(mockRecord);
      expect(recordRepo.create).toHaveBeenCalledWith({
        ...createDto,
        patientId: mockPatient.id,
        createdBy: doctorUser.id,
      });
      expect(recordRepo.save).toHaveBeenCalledWith(mockRecord);
      expect(recordRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockRecord.id },
        relations: ["creator"],
      });
    });

    it("should throw InternalServerErrorException when re-fetch after save fails", async () => {
      patientRepo.findOne.mockResolvedValue(mockPatient);
      recordRepo.create.mockReturnValue(mockRecord);
      recordRepo.save.mockResolvedValue(mockRecord);
      recordRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create(mockPatient.id, createDto, doctorUser)
      ).rejects.toThrow(InternalServerErrorException);
    });

    it("should throw NotFoundException when patient does not exist", async () => {
      patientRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create("missing", createDto, doctorUser)
      ).rejects.toThrow(NotFoundException);
    });
  });
});
