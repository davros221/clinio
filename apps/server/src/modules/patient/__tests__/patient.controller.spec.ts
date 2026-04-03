import { Test, TestingModule } from "@nestjs/testing";
import { PatientController } from "../patient.controller";
import { PatientService } from "../patient.service";
import { PatientMapper } from "../mapper/PatientMapper";
import { PatientEntity } from "../patient.entity";
import { UpdatePatientDto } from "../dto/update-patient.dto";

const mockPatient: PatientEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  firstName: "Jan",
  lastName: "Novák",
  birthNumber: "900101/1234",
  birthdate: new Date("1990-01-01"),
  phone: "+420123456789",
  email: "jan.novak@example.com",
};

describe("PatientController", () => {
  let controller: PatientController;
  let service: jest.Mocked<PatientService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientController],
      providers: [
        {
          provide: PatientService,
          useValue: {
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PatientController>(PatientController);
    service = module.get(PatientService);
  });

  describe("getById", () => {
    it("should return mapped patient DTO", async () => {
      service.findById.mockResolvedValue(mockPatient);
      const result = await controller.getById(mockPatient.id);
      expect(result).toEqual(PatientMapper.toDto(mockPatient));
    });
  });

  describe("create", () => {
    it("should create and return mapped DTO", async () => {
      service.create.mockResolvedValue(mockPatient);
      const result = await controller.create(mockPatient as any);
      expect(result).toEqual(PatientMapper.toDto(mockPatient));
    });
  });

  // ADDED: Update test block
  describe("update", () => {
    it("should update patient and return mapped DTO", async () => {
      const updateDto: UpdatePatientDto = { phone: "+420987654321" };
      const updatedEntity: PatientEntity = { ...mockPatient, ...updateDto };

      service.update.mockResolvedValue(updatedEntity);

      const result = await controller.update(mockPatient.id, updateDto);

      expect(result).toEqual(PatientMapper.toDto(updatedEntity));
      expect(service.update).toHaveBeenCalledWith(mockPatient.id, updateDto);
    });
  });

  describe("delete", () => {
    it("should call service delete", async () => {
      service.delete.mockResolvedValue(undefined);
      await controller.delete(mockPatient.id);
      expect(service.delete).toHaveBeenCalledWith(mockPatient.id);
    });
  });
});
