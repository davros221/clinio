import { Test, TestingModule } from "@nestjs/testing";
import { PatientController } from "../patient.controller";
import { PatientService } from "../patient.service";
import { PatientMapper } from "../mapper/PatientMapper";
import { PatientEntity } from "../patient.entity";
import { UpdatePatientDto } from "../dto/update-patient.dto";
import { UserEntity } from "../../user/user.entity";
import { UserRole } from "@clinio/shared";
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

const doctorUser: AuthUser = {
  id: "doctor-uuid-0001",
  email: "doctor@example.com",
  role: UserRole.DOCTOR,
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
            findAll: jest.fn(),
            findById: jest.fn(),
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
      const result = await controller.getById(doctorUser, mockPatient.id);
      expect(result).toEqual(PatientMapper.toDto(mockPatient));
      expect(service.findById).toHaveBeenCalledWith(mockPatient.id, doctorUser);
    });
  });

  describe("update", () => {
    it("should update patient and return mapped DTO", async () => {
      const updateDto: UpdatePatientDto = { phone: "+420987654321" };
      const updatedEntity: PatientEntity = { ...mockPatient, ...updateDto };

      service.update.mockResolvedValue(updatedEntity);

      const result = await controller.update(
        clientUser,
        mockPatient.id,
        updateDto
      );

      expect(result).toEqual(PatientMapper.toDto(updatedEntity));
      expect(service.update).toHaveBeenCalledWith(
        mockPatient.id,
        updateDto,
        clientUser
      );
    });
  });

  describe("delete", () => {
    it("should call service delete method and return void", async () => {
      service.delete.mockResolvedValue(undefined);

      const result = await controller.delete(doctorUser, mockPatient.id);

      expect(result).toBeUndefined();
      expect(service.delete).toHaveBeenCalledWith(mockPatient.id, doctorUser);
    });

    it("should pass clientUser to service delete method", async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.delete(clientUser, mockPatient.id);

      expect(service.delete).toHaveBeenCalledWith(mockPatient.id, clientUser);
    });
  });
});
