import { PatientMapper } from "../mapper/PatientMapper";
import { PatientEntity } from "../patient.entity";
import { UserEntity } from "../../user/user.entity";
import { UserRole } from "@clinio/shared";

const mockUser: UserEntity = {
  id: "user-uuid-0001",
  email: "jan.novak@example.com",
  password: null,
  firstName: "Jan",
  lastName: "Novák",
  role: UserRole.CLIENT,
};

const mockEntity: PatientEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  userId: mockUser.id,
  user: mockUser,
  birthNumber: "900101/1234",
  birthdate: new Date("1990-01-01"),
  phone: "+420123456789",
};

describe("PatientMapper", () => {
  describe("toDto", () => {
    it("should map entity to DTO with correct fields", () => {
      const dto = PatientMapper.toDto(mockEntity);

      expect(dto).toEqual({
        id: mockEntity.id,
        userId: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        birthNumber: mockEntity.birthNumber,
        birthdate: mockEntity.birthdate,
        phone: mockEntity.phone,
        email: mockUser.email,
      });
    });
  });

  describe("toDtoList", () => {
    it("should map array of entities to DTOs", () => {
      const secondUser: UserEntity = {
        ...mockUser,
        id: "user-uuid-0002",
        firstName: "Petr",
        email: "petr.novak@example.com",
      };
      const secondEntity: PatientEntity = {
        ...mockEntity,
        id: "660e8400-e29b-41d4-a716-446655440001",
        userId: secondUser.id,
        user: secondUser,
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
