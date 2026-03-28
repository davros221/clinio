import { OfficeMapper } from "../mapper/OfficeMapper";
import { OfficeEntity } from "../office.entity";

const mockEntity: OfficeEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Main Office",
  specialization: "General",
  address: "123 Main St",
  officeHoursTemplate: {
    monday: [{ from: 9, to: 17 }],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  },
  doctors: [],
  nurses: [],
};

describe("OfficeMapper", () => {
  describe("toDto", () => {
    it("should map entity to DTO with correct fields", () => {
      const dto = OfficeMapper.toDto(mockEntity);

      expect(dto).toEqual({
        id: mockEntity.id,
        name: mockEntity.name,
        specialization: mockEntity.specialization,
        address: mockEntity.address,
        officeHoursTemplate: mockEntity.officeHoursTemplate,
      });
    });

    it("should NOT include doctors in DTO", () => {
      const dto = OfficeMapper.toDto(mockEntity);

      expect(dto).not.toHaveProperty("doctors");
    });

    it("should NOT include nurses in DTO", () => {
      const dto = OfficeMapper.toDto(mockEntity);

      expect(dto).not.toHaveProperty("nurses");
    });
  });

  describe("toDtoList", () => {
    it("should map array of entities to DTOs", () => {
      const secondEntity: OfficeEntity = {
        ...mockEntity,
        id: "660e8400-e29b-41d4-a716-446655440001",
        name: "Branch Office",
      };

      const dtos = OfficeMapper.toDtoList([mockEntity, secondEntity]);

      expect(dtos).toHaveLength(2);
      expect(dtos[0]).toEqual(OfficeMapper.toDto(mockEntity));
      expect(dtos[1]).toEqual(OfficeMapper.toDto(secondEntity));
    });

    it("should return empty array for empty input", () => {
      const dtos = OfficeMapper.toDtoList([]);

      expect(dtos).toEqual([]);
    });
  });
});
