import { UserMapper } from "../mapper/UserMapper";
import { UserEntity } from "../user.entity";
import { UserRole } from "@clinio/shared";

const mockEntity: UserEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "john@example.com",
  password: "secret-hashed-password",
  firstName: "John",
  lastName: "Doe",
  role: UserRole.DOCTOR,
};

describe("UserMapper", () => {
  describe("toDto", () => {
    it("should map entity to DTO with correct fields", () => {
      const dto = UserMapper.toDto(mockEntity);

      expect(dto).toEqual({
        id: mockEntity.id,
        email: mockEntity.email,
        firstName: mockEntity.firstName,
        lastName: mockEntity.lastName,
        role: mockEntity.role,
      });
    });

    it("should NOT include password in DTO", () => {
      const dto = UserMapper.toDto(mockEntity);

      expect(dto).not.toHaveProperty("password");
    });

    it("should include role in DTO", () => {
      const dto = UserMapper.toDto(mockEntity);

      expect(dto).toHaveProperty("role", mockEntity.role);
    });
  });

  describe("toDtoList", () => {
    it("should map array of entities to DTOs", () => {
      const secondEntity: UserEntity = {
        ...mockEntity,
        id: "660e8400-e29b-41d4-a716-446655440001",
        email: "jane@example.com",
        firstName: "Jane",
      };

      const dtos = UserMapper.toDtoList([mockEntity, secondEntity]);

      expect(dtos).toHaveLength(2);
      expect(dtos[0]).toEqual(UserMapper.toDto(mockEntity));
      expect(dtos[1]).toEqual(UserMapper.toDto(secondEntity));
    });

    it("should return empty array for empty input", () => {
      const dtos = UserMapper.toDtoList([]);

      expect(dtos).toEqual([]);
    });
  });
});
