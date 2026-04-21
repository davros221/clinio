import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import {
  ErrorCode,
  MedicalRecordSortField,
  SortOrder,
  UserRole,
} from "@clinio/shared";
import { MedicalRecordController } from "../medical-record.controller";
import { MedicalRecordService } from "../medical-record.service";
import { MedicalRecordEntity } from "../medical-record.entity";
import { MedicalRecordMapper } from "../mapper/MedicalRecordMapper";
import { CreateMedicalRecordDto } from "../dto/create-medical-record.dto";
import { PatientEntity } from "../../patient/patient.entity";
import { UserEntity } from "../../user/user.entity";
import { AuthUser } from "../../../auth/strategies/jwt.strategy";
import { medicalRecordNotFound } from "../../../common/error-messages";

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

const mockRecordDto = MedicalRecordMapper.toDto(mockRecord);

const mockMedicalRecordService = () => ({
  findAllForPatient: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
});

describe("MedicalRecordController", () => {
  let controller: MedicalRecordController;
  let service: jest.Mocked<
    Pick<MedicalRecordService, "findAllForPatient" | "findById" | "create">
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalRecordController],
      providers: [
        {
          provide: MedicalRecordService,
          useFactory: mockMedicalRecordService,
        },
      ],
    }).compile();

    controller = module.get<MedicalRecordController>(MedicalRecordController);
    service = module.get(MedicalRecordService);
  });

  describe("getAll", () => {
    const defaultQuery = {
      page: 1,
      limit: 20,
      sortBy: MedicalRecordSortField.CREATED_AT,
      sortOrder: SortOrder.DESC,
    };

    it("should return paginated record DTOs", async () => {
      service.findAllForPatient.mockResolvedValue({
        items: [mockRecord],
        total: 1,
      });

      const result = await controller.getAll(
        doctorUser,
        mockPatient.id,
        defaultQuery
      );

      expect(result).toEqual({
        items: [mockRecordDto],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(service.findAllForPatient).toHaveBeenCalledWith(
        mockPatient.id,
        defaultQuery,
        doctorUser
      );
    });

    it("should calculate totalPages correctly", async () => {
      service.findAllForPatient.mockResolvedValue({
        items: [mockRecord],
        total: 45,
      });

      const result = await controller.getAll(
        doctorUser,
        mockPatient.id,
        defaultQuery
      );

      expect(result.totalPages).toBe(3);
    });
  });

  describe("getById", () => {
    it("should return mapped record DTO", async () => {
      service.findById.mockResolvedValue(mockRecord);

      const result = await controller.getById(
        doctorUser,
        mockPatient.id,
        mockRecord.id
      );

      expect(result).toEqual(mockRecordDto);
      expect(service.findById).toHaveBeenCalledWith(
        mockPatient.id,
        mockRecord.id,
        doctorUser
      );
    });

    it("should throw NotFoundException with MEDICAL_RECORD_NOT_FOUND code", async () => {
      service.findById.mockRejectedValue(medicalRecordNotFound());

      try {
        await controller.getById(doctorUser, mockPatient.id, "missing");
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect((error as NotFoundException).getResponse()).toMatchObject({
          errorCode: ErrorCode.MEDICAL_RECORD_NOT_FOUND,
        });
      }
    });
  });

  describe("create", () => {
    const createDto: CreateMedicalRecordDto = {
      examinationSummary: "Routine follow-up",
      diagnosis: "No issues",
    };

    it("should create record and return mapped DTO", async () => {
      service.create.mockResolvedValue(mockRecord);

      const result = await controller.create(
        doctorUser,
        mockPatient.id,
        createDto
      );

      expect(result).toEqual(mockRecordDto);
      expect(service.create).toHaveBeenCalledWith(
        mockPatient.id,
        createDto,
        doctorUser
      );
    });
  });
});
