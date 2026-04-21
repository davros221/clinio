import { UserRole } from "@clinio/shared";
import { MedicalRecordMapper } from "../mapper/MedicalRecordMapper";
import { MedicalRecordEntity } from "../medical-record.entity";
import { PatientEntity } from "../../patient/patient.entity";
import { UserEntity } from "../../user/user.entity";

const mockClientUserEntity: UserEntity = {
  id: "user-uuid-0001",
  email: "jan.novak@example.com",
  password: null,
  firstName: "Jan",
  lastName: "Novák",
  role: UserRole.CLIENT,
};

const mockPatient: PatientEntity = {
  id: "patient-uuid-0001",
  userId: mockClientUserEntity.id,
  user: mockClientUserEntity,
  birthNumber: "900101/1234",
  birthdate: new Date("1990-01-01"),
  phone: "+420123456789",
};

const mockCreator: UserEntity = {
  id: "doctor-uuid-0001",
  email: "doctor@example.com",
  password: null,
  firstName: "Anna",
  lastName: "Lékařská",
  role: UserRole.DOCTOR,
};

const mockEntity: MedicalRecordEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  patientId: mockPatient.id,
  patient: mockPatient,
  createdBy: mockCreator.id,
  creator: mockCreator,
  createdAt: new Date("2026-04-01T10:00:00Z"),
  examinationSummary: "Standard checkup",
  diagnosis: "Healthy",
};

describe("MedicalRecordMapper", () => {
  describe("toDto", () => {
    it("should map entity to DTO with correct fields", () => {
      const dto = MedicalRecordMapper.toDto(mockEntity);

      expect(dto).toEqual({
        id: mockEntity.id,
        patientId: mockEntity.patientId,
        createdBy: `${mockCreator.firstName} ${mockCreator.lastName}`,
        createdAt: mockEntity.createdAt,
        examinationSummary: mockEntity.examinationSummary,
        diagnosis: mockEntity.diagnosis,
      });
    });

    it("should preserve null for optional text fields", () => {
      const entity: MedicalRecordEntity = {
        ...mockEntity,
        examinationSummary: null,
        diagnosis: null,
      };

      const dto = MedicalRecordMapper.toDto(entity);

      expect(dto.examinationSummary).toBeNull();
      expect(dto.diagnosis).toBeNull();
    });
  });

  describe("toDtoList", () => {
    it("should map array of entities to DTOs", () => {
      const second: MedicalRecordEntity = {
        ...mockEntity,
        id: "660e8400-e29b-41d4-a716-446655440001",
        diagnosis: "Flu",
      };

      const dtos = MedicalRecordMapper.toDtoList([mockEntity, second]);

      expect(dtos).toHaveLength(2);
      expect(dtos[0]).toEqual(MedicalRecordMapper.toDto(mockEntity));
      expect(dtos[1]).toEqual(MedicalRecordMapper.toDto(second));
    });

    it("should return an empty array for an empty input", () => {
      expect(MedicalRecordMapper.toDtoList([])).toEqual([]);
    });
  });
});
