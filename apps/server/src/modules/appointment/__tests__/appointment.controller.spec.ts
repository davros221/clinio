import { Test, TestingModule } from "@nestjs/testing";
import { AppointmentController } from "../appointment.controller";
import { AppointmentService } from "../appointment.service";
import { AppointmentEntity } from "../appointment.entity";
import { AppointmentMapper } from "../mapper/AppointmentMapper";
import { CreateAppointmentDto } from "../dto/create-appointment.dto";
import { UpdateAppointmentDto } from "../dto/update-appointment.dto";
import { RescheduleAppointmentDto } from "../dto/reschedule-appointment.dto";
import {
  AppointmentStatus,
  AppointmentSortField,
  SortOrder,
  ErrorCode,
  UserRole,
} from "@clinio/shared";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { appointmentNotFound } from "../../../common/error-messages";
import { AuthUser } from "../../../auth/strategies/jwt.strategy";

const adminUser: AuthUser = {
  id: "admin-1",
  email: "admin@test.com",
  role: UserRole.ADMIN,
};

const doctorUser: AuthUser = {
  id: "doctor-1",
  email: "doctor@test.com",
  role: UserRole.DOCTOR,
};

const mockAppointment: AppointmentEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  officeId: "office-1",
  office: null,
  patientId: "patient-1",
  patient: null,
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
  update: jest.fn(),
  reschedule: jest.fn(),
  cancel: jest.fn(),
  remove: jest.fn(),
});

describe("AppointmentController", () => {
  let controller: AppointmentController;
  let service: jest.Mocked<
    Pick<
      AppointmentService,
      | "findAll"
      | "findById"
      | "create"
      | "update"
      | "reschedule"
      | "cancel"
      | "remove"
    >
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

      const result = await controller.getAll(adminUser);

      expect(result).toEqual({
        items: [mockAppointmentDto],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(service.findAll).toHaveBeenCalledWith(
        defaultQuery,
        adminUser,
        undefined,
        undefined
      );
    });

    it("should return empty items when no appointments exist", async () => {
      service.findAll.mockResolvedValue({ items: [], total: 0 });

      const result = await controller.getAll(adminUser);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it("should pass pagination and sorting params to service", async () => {
      service.findAll.mockResolvedValue({ items: [mockAppointment], total: 1 });

      await controller.getAll(
        adminUser,
        undefined,
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
        adminUser,
        undefined,
        undefined
      );
    });

    it("should filter by status when provided", async () => {
      service.findAll.mockResolvedValue({ items: [mockAppointment], total: 1 });

      await controller.getAll(adminUser, AppointmentStatus.PLANNED);

      expect(service.findAll).toHaveBeenCalledWith(
        defaultQuery,
        adminUser,
        [AppointmentStatus.PLANNED],
        undefined
      );
    });

    it("should pass officeId to service", async () => {
      service.findAll.mockResolvedValue({ items: [mockAppointment], total: 1 });

      await controller.getAll(adminUser, undefined, "office-1");

      expect(service.findAll).toHaveBeenCalledWith(
        defaultQuery,
        adminUser,
        undefined,
        "office-1"
      );
    });

    it("should calculate totalPages correctly", async () => {
      service.findAll.mockResolvedValue({
        items: [mockAppointment],
        total: 45,
      });

      const result = await controller.getAll(
        adminUser,
        undefined,
        undefined,
        "1",
        "20"
      );

      expect(result.totalPages).toBe(3);
    });
  });

  describe("getById", () => {
    it("should return mapped appointment DTO", async () => {
      service.findById.mockResolvedValue(mockAppointment);

      const result = await controller.getById(mockAppointment.id, adminUser);

      expect(result).toEqual(mockAppointmentDto);
      expect(service.findById).toHaveBeenCalledWith(
        mockAppointment.id,
        adminUser
      );
    });

    it("should throw NotFoundException when appointment not found", async () => {
      service.findById.mockRejectedValue(appointmentNotFound());

      await expect(
        controller.getById("non-existent-id", adminUser)
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException with APPOINTMENT_NOT_FOUND error code", async () => {
      service.findById.mockRejectedValue(appointmentNotFound());

      try {
        await controller.getById("non-existent-id", adminUser);
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
      officeId: "office-1",
      date: "2026-04-01",
      hour: 10,
      status: AppointmentStatus.PLANNED,
      note: "Follow-up visit",
    };

    it("should create appointment and return mapped DTO", async () => {
      service.create.mockResolvedValue(mockAppointment);

      const result = await controller.create(createDto, doctorUser);

      expect(result).toEqual(mockAppointmentDto);
      expect(service.create).toHaveBeenCalledWith(createDto, doctorUser);
    });
  });

  describe("update", () => {
    const updateDto: UpdateAppointmentDto = { note: "Updated" };

    it("should delegate to service and return mapped DTO", async () => {
      service.update.mockResolvedValue(mockAppointment);

      const result = await controller.update(
        mockAppointment.id,
        updateDto,
        doctorUser
      );

      expect(result).toEqual(mockAppointmentDto);
      expect(service.update).toHaveBeenCalledWith(
        mockAppointment.id,
        updateDto,
        doctorUser
      );
    });

    it("should propagate NotFoundException from service", async () => {
      service.update.mockRejectedValue(appointmentNotFound());

      await expect(
        controller.update("non-existent-id", updateDto, doctorUser)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("reschedule", () => {
    const rescheduleDto: RescheduleAppointmentDto = {
      date: "2026-04-02",
      hour: 14,
    };

    it("should delegate to service and return mapped DTO", async () => {
      service.reschedule.mockResolvedValue(mockAppointment);

      const result = await controller.reschedule(
        mockAppointment.id,
        rescheduleDto,
        doctorUser
      );

      expect(result).toEqual(mockAppointmentDto);
      expect(service.reschedule).toHaveBeenCalledWith(
        mockAppointment.id,
        rescheduleDto,
        doctorUser
      );
    });

    it("should propagate ForbiddenException from service", async () => {
      service.reschedule.mockRejectedValue(new ForbiddenException());

      await expect(
        controller.reschedule(mockAppointment.id, rescheduleDto, doctorUser)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("cancel", () => {
    it("should delegate to service and return mapped DTO", async () => {
      service.cancel.mockResolvedValue({
        ...mockAppointment,
        status: AppointmentStatus.CANCELLED,
      });

      const result = await controller.cancel(mockAppointment.id, doctorUser);

      expect(result.status).toBe(AppointmentStatus.CANCELLED);
      expect(service.cancel).toHaveBeenCalledWith(
        mockAppointment.id,
        doctorUser
      );
    });

    it("should propagate NotFoundException from service", async () => {
      service.cancel.mockRejectedValue(appointmentNotFound());

      await expect(
        controller.cancel("non-existent-id", doctorUser)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should delegate to service and return void", async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockAppointment.id, doctorUser);

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(
        mockAppointment.id,
        doctorUser
      );
    });

    it("should propagate NotFoundException from service", async () => {
      service.remove.mockRejectedValue(appointmentNotFound());

      await expect(
        controller.remove("non-existent-id", doctorUser)
      ).rejects.toThrow(NotFoundException);
    });

    it("should propagate ForbiddenException from service", async () => {
      service.remove.mockRejectedValue(new ForbiddenException());

      await expect(
        controller.remove(mockAppointment.id, doctorUser)
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
