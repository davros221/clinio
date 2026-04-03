import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PatientService } from "./patient.service";
import { PatientEntity } from "./patient.entity";
import { ErrorCode } from "@clinio/shared";
import { CreatePatientDto } from "./dto/create-patient.dto";

const mockPatient: PatientEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  firstName: "Jan",
  lastName: "Novák",
  birthNumber: "900101/1234",
  birthdate: new Date("1990-01-01"),
  phone: "+420123456789",
  email: "jan.novak@example.com",
};

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
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PatientService>(PatientService);
    repository = module.get(getRepositoryToken(PatientEntity));
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
  });

  describe("create", () => {
    it("should create and save a new patient", async () => {
      const dto: CreatePatientDto = { ...mockPatient };
      repository.create.mockReturnValue(mockPatient);
      repository.save.mockResolvedValue(mockPatient);

      const result = await service.create(dto);
      expect(result).toEqual(mockPatient);
      expect(repository.create).toHaveBeenCalledWith(dto);
    });
  });

  describe("delete", () => {
    it("should delete the patient if they exist", async () => {
      repository.delete.mockResolvedValue({ affected: 1, raw: [] });
      await expect(service.delete(mockPatient.id)).resolves.not.toThrow();
    });

    it("should throw error if no patient was deleted", async () => {
      repository.delete.mockResolvedValue({ affected: 0, raw: [] });
      await expect(service.delete("none")).rejects.toThrow();
    });
  });
});
