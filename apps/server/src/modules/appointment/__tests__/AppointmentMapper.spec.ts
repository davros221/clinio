import { AppointmentMapper } from "../mapper/AppointmentMapper";
import { AppointmentEntity } from "../appointment.entity";
import { AppointmentStatus } from "@clinio/shared";

const mockEntity: AppointmentEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  officeId: "660e8400-e29b-41d4-a716-446655440001",
  office: {
    id: "660e8400-e29b-41d4-a716-446655440001",
    name: "Main Office",
    specialization: "General",
    address: "123 Main St",
    officeHoursTemplate: null,
    staff: [],
  },
  patientId: "patient-1",
  datetime: new Date("2026-04-01T10:00:00Z"),
  status: AppointmentStatus.PLANNED,
  note: "Initial consultation",
};

describe("AppointmentMapper", () => {
  describe("toDto", () => {
    it("should map entity to DTO with correct fields", () => {
      const dto = AppointmentMapper.toDto(mockEntity);

      expect(dto).toEqual({
        id: mockEntity.id,
        officeId: mockEntity.officeId,
        patientId: mockEntity.patientId,
        datetime: mockEntity.datetime,
        status: mockEntity.status,
        note: mockEntity.note,
      });
    });

    it("should NOT include office relation in DTO", () => {
      const dto = AppointmentMapper.toDto(mockEntity);

      expect(dto).not.toHaveProperty("office");
    });

    it("should handle null patientId", () => {
      const entity: AppointmentEntity = { ...mockEntity, patientId: null };
      const dto = AppointmentMapper.toDto(entity);

      expect(dto.patientId).toBeNull();
    });
  });

  describe("toDtoList", () => {
    it("should map array of entities to DTOs", () => {
      const secondEntity: AppointmentEntity = {
        ...mockEntity,
        id: "660e8400-e29b-41d4-a716-446655440002",
        status: AppointmentStatus.COMPLETED,
      };

      const dtos = AppointmentMapper.toDtoList([mockEntity, secondEntity]);

      expect(dtos).toHaveLength(2);
      expect(dtos[0]).toEqual(AppointmentMapper.toDto(mockEntity));
      expect(dtos[1]).toEqual(AppointmentMapper.toDto(secondEntity));
    });

    it("should return empty array for empty input", () => {
      const dtos = AppointmentMapper.toDtoList([]);

      expect(dtos).toEqual([]);
    });
  });
});
