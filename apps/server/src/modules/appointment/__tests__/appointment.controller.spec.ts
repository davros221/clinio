import { Test, TestingModule } from "@nestjs/testing";
import { AppointmentController } from "../appointment.controller";
import { AppointmentService } from "../appointment.service";
import { AppointmentEntity } from "../appointment.entity";
import { AppointmentMapper } from "../mapper/AppointmentMapper";
import { CreateAppointmentDto } from "../dto/create-appointment.dto";
import {
  AppointmentStatus,
  AppointmentSortField,
  SortOrder,
  ErrorCode,
} from "@clinio/shared";
import { NotFoundException } from "@nestjs/common";
import { appointmentNotFound } from "../../../common/error-messages";

const mockAppointment: AppointmentEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  officeId: null,
  office: null,
  patientId: "patient-1",
  date: "2026-04-01",
  hour: 10,
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
    const defaultQuery = {
      page: 1,
      limit: 20,
      sortBy: AppointmentSortField.DATE,
      sortOrder: SortOrder.ASC,
    };

    it("should return paginated appointment DTOs", async () => {
      service.findAll.mockResolvedValue({ items: [mockAppointment], total: 1 });

      const result = await controller.getAll();

      expect(result).toEqual({
        items: [mockAppointmentDto],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(service.findAll).toHaveBeenCalledWith(defaultQuery, undefined);
    });

    it("should return empty items when no appointments exist", async () => {
      service.findAll.mockResolvedValue({ items: [], total: 0 });

      const result = await controller.getAll();

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it("should pass pagination and sorting params to service", async () => {
      service.findAll.mockResolvedValue({ items: [mockAppointment], total: 1 });

      await controller.getAll(
        undefined,
        "2",
        "10",
        AppointmentSortField.STATUS,
        SortOrder.DESC
      );

      expect(service.findAll).toHaveBeenCalledWith(
        {
          page: 2,
          limit: 10,
          sortBy: AppointmentSortField.STATUS,
          sortOrder: SortOrder.DESC,
        },
        undefined
      );
    });

    it("should filter by status when provided", async () => {
      service.findAll.mockResolvedValue({ items: [mockAppointment], total: 1 });

      await controller.getAll(AppointmentStatus.PLANNED);

      expect(service.findAll).toHaveBeenCalledWith(defaultQuery, [
        AppointmentStatus.PLANNED,
      ]);
    });

    it("should filter by multiple statuses", async () => {
      service.findAll.mockResolvedValue({ items: [mockAppointment], total: 1 });

      await controller.getAll([
        AppointmentStatus.PLANNED,
        AppointmentStatus.COMPLETED,
      ]);

      expect(service.findAll).toHaveBeenCalledWith(defaultQuery, [
        AppointmentStatus.PLANNED,
        AppointmentStatus.COMPLETED,
      ]);
    });

    it("should calculate totalPages correctly", async () => {
      service.findAll.mockResolvedValue({
        items: [mockAppointment],
        total: 45,
      });

      const result = await controller.getAll(undefined, "1", "20");

      expect(result.totalPages).toBe(3);
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
      date: "2026-04-01",
      hour: 10,
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
