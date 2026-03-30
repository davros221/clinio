import { Test, TestingModule } from "@nestjs/testing";
import { AppointmentController } from "../appointment.controller";
import { AppointmentService } from "../appointment.service";
import { AppointmentEntity } from "../appointment.entity";
import { AppointmentMapper } from "../mapper/AppointmentMapper";
import { CreateAppointmentDto } from "../dto/create-appointment.dto";
import { AppointmentStatus, ErrorCode } from "@clinio/shared";
import { NotFoundException } from "@nestjs/common";
import { appointmentNotFound } from "../../../common/error-messages";

const mockAppointment: AppointmentEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  officeId: null,
  office: null,
  patientId: "patient-1",
  datetime: new Date("2026-04-01T10:00:00Z"),
  status: AppointmentStatus.PLANNED,
  note: "Follow-up visit",
};

const mockAppointmentDto = AppointmentMapper.toDto(mockAppointment);

const mockAppointmentService = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
});

describe("AppointmentController", () => {
  let controller: AppointmentController;
  let service: jest.Mocked<
    Pick<AppointmentService, "findAll" | "findById" | "create">
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentController],
      providers: [
        {
          provide: AppointmentService,
          useFactory: mockAppointmentService,
        },
      ],
    }).compile();

    controller = module.get<AppointmentController>(AppointmentController);
    service = module.get(AppointmentService);
  });

  describe("getAll", () => {
    it("should return mapped appointment DTOs", async () => {
      service.findAll.mockResolvedValue([mockAppointment]);

      const result = await controller.getAll();

      expect(result).toEqual([mockAppointmentDto]);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no appointments exist", async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.getAll();

      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("should return mapped appointment DTO", async () => {
      service.findById.mockResolvedValue(mockAppointment);

      const result = await controller.getById(mockAppointment.id);

      expect(result).toEqual(mockAppointmentDto);
      expect(service.findById).toHaveBeenCalledWith(mockAppointment.id);
    });

    it("should throw NotFoundException when appointment not found", async () => {
      service.findById.mockRejectedValue(appointmentNotFound());

      await expect(controller.getById("non-existent-id")).rejects.toThrow(
        NotFoundException
      );
    });

    it("should throw NotFoundException with APPOINTMENT_NOT_FOUND error code", async () => {
      service.findById.mockRejectedValue(appointmentNotFound());

      try {
        await controller.getById("non-existent-id");
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect((error as NotFoundException).getResponse()).toMatchObject({
          errorCode: ErrorCode.APPOINTMENT_NOT_FOUND,
        });
      }
    });
  });

  describe("create", () => {
    const createDto: CreateAppointmentDto = {
      officeId: null,
      patientId: "patient-1",
      datetime: "2026-04-01T10:00:00Z",
      status: AppointmentStatus.PLANNED,
      note: "Follow-up visit",
    };

    it("should create appointment and return mapped DTO", async () => {
      service.create.mockResolvedValue(mockAppointment);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockAppointmentDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });
});
