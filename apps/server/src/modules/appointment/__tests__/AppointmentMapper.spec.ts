import { AppointmentMapper } from "../mapper/AppointmentMapper";
import { AppointmentEntity } from "../appointment.entity";
import { AppointmentStatus } from "@clinio/shared";
import { OfficeEntity } from "../../office/office.entity";

const mockOffice = { id: "office-1", name: "Ordinace Praha" } as OfficeEntity;

const mockEntity: AppointmentEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  officeId: "office-1",
  office: mockOffice,
  patientId: "patient-1",
  patient: null,
  date: "2026-04-01",
  hour: 10,
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
        office: { id: mockOffice.id, name: mockOffice.name },
        patientId: mockEntity.patientId,
        date: mockEntity.date,
        hour: mockEntity.hour,
        status: mockEntity.status,
        note: mockEntity.note,
      });
    });

    it("should map office to id and name only", () => {
      const dto = AppointmentMapper.toDto(mockEntity);

      expect(dto.office).toEqual({ id: "office-1", name: "Ordinace Praha" });
    });

    it("should set office to null when relation is not loaded", () => {
      const entity: AppointmentEntity = { ...mockEntity, office: null };
      const dto = AppointmentMapper.toDto(entity);

      expect(dto.office).toBeNull();
    });

    it("should handle null patientId", () => {
      const entity: AppointmentEntity = {
        ...mockEntity,
        patientId: null,
        patient: null,
      };
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
