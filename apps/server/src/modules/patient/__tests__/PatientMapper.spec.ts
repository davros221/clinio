import { PatientMapper } from "../mapper/PatientMapper";
import { PatientEntity } from "../patient.entity";

const mockEntity: PatientEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  firstName: "Jan",
  lastName: "Novák",
  birthNumber: "900101/1234",
  birthdate: new Date("1990-01-01"),
  phone: "+420123456789",
  email: "jan.novak@example.com",
};

describe("PatientMapper", () => {
  describe("toDto", () => {
    it("should map entity to DTO with correct fields", () => {
      const dto = PatientMapper.toDto(mockEntity);

      expect(dto).toEqual({
        id: mockEntity.id,
        firstName: mockEntity.firstName,
        lastName: mockEntity.lastName,
        birthNumber: mockEntity.birthNumber,
        birthdate: mockEntity.birthdate,
        phone: mockEntity.phone,
        email: mockEntity.email,
      });
    });
  });

  describe("toDtoList", () => {
    it("should map array of entities to DTOs", () => {
      const secondEntity: PatientEntity = {
        ...mockEntity,
        id: "660e8400-e29b-41d4-a716-446655440001",
        firstName: "Petr",
        email: "petr.novak@example.com",
      };

      const dtos = PatientMapper.toDtoList([mockEntity, secondEntity]);

      expect(dtos).toHaveLength(2);
      expect(dtos[0]).toEqual(PatientMapper.toDto(mockEntity));
      expect(dtos[1]).toEqual(PatientMapper.toDto(secondEntity));
    });

    it("should return an empty array if provided with an empty array", () => {
      const dtos = PatientMapper.toDtoList([]);
      expect(dtos).toHaveLength(0);
      expect(dtos).toEqual([]);
    });
  });
});
