import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { AppointmentService } from "../appointment.service";
import { AppointmentEntity } from "../appointment.entity";
import {
  AppointmentStatus,
  AppointmentSortField,
  SortOrder,
  ErrorCode,
} from "@clinio/shared";
import { CreateAppointmentDto } from "../dto/create-appointment.dto";

const mockAppointment: AppointmentEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  officeId: null,
  office: null,
  patientId: null,
  date: "2026-04-01",
  hour: 10,
  status: AppointmentStatus.PLANNED,
  note: "Initial consultation",
};

const defaultQuery = {
  page: 1,
  limit: 20,
  sortBy: AppointmentSortField.DATE,
  sortOrder: SortOrder.ASC,
};

const mockAppointmentRepository = () => ({
  find: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe("AppointmentService", () => {
  let service: AppointmentService;
  let repository: jest.Mocked<
    Pick<
      Repository<AppointmentEntity>,
      "find" | "findAndCount" | "findOne" | "create" | "save"
    >
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: getRepositoryToken(AppointmentEntity),
          useFactory: mockAppointmentRepository,
        },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    repository = module.get(getRepositoryToken(AppointmentEntity));
  });

  describe("findAll", () => {
    it("should return appointments with pagination", async () => {
      repository.findAndCount.mockResolvedValue([[mockAppointment], 1]);

      const result = await service.findAll(defaultQuery);

      expect(result).toEqual({ items: [mockAppointment], total: 1 });
      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: ["office"],
        order: { date: "ASC" },
        skip: 0,
        take: 20,
      });
    });

    it("should apply correct skip for page 2", async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ ...defaultQuery, page: 2 });

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 20 })
      );
    });

    it("should apply sorting parameters", async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({
        ...defaultQuery,
        sortBy: AppointmentSortField.STATUS,
        sortOrder: SortOrder.DESC,
      });

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ order: { status: "DESC" } })
      );
    });

    it("should filter by statuses when provided", async () => {
      repository.findAndCount.mockResolvedValue([[mockAppointment], 1]);

      await service.findAll(defaultQuery, [AppointmentStatus.PLANNED]);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: expect.anything() },
        })
      );
    });

    it("should not filter by status when statuses not provided", async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(defaultQuery);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      );
    });
  });

  describe("findById", () => {
    it("should return appointment when found", async () => {
      repository.findOne.mockResolvedValue(mockAppointment);

      const result = await service.findById(mockAppointment.id);

      expect(result).toEqual(mockAppointment);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockAppointment.id },
        relations: ["office"],
      });
    });

    it("should throw NotFoundException when appointment not found", async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById("non-existent-id")).rejects.toThrow(
        NotFoundException
      );
    });

    it("should throw NotFoundException with APPOINTMENT_NOT_FOUND error code", async () => {
      repository.findOne.mockResolvedValue(null);

      try {
        await service.findById("non-existent-id");
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect((error as NotFoundException).getResponse()).toMatchObject({
          errorCode: ErrorCode.APPOINTMENT_NOT_FOUND,
        });
      }
    });

    it("should throw InternalServerErrorException when repository throws", async () => {
      repository.findOne.mockRejectedValue(new Error("DB error"));

      try {
        await service.findById(mockAppointment.id);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(
          (error as InternalServerErrorException).getResponse()
        ).toMatchObject({
          errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
        });
      }
    });
  });

  describe("findByOfficeAndWeek", () => {
    it("should query by officeId and date range for the week", async () => {
      repository.find.mockResolvedValue([mockAppointment]);

      const weekStart = new Date("2026-03-30T00:00:00.000Z");
      const result = await service.findByOfficeAndWeek("office-1", weekStart);

      expect(result).toEqual([mockAppointment]);
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          officeId: "office-1",
          date: expect.anything(),
        },
      });
    });
  });

  describe("create", () => {
    const createDto: CreateAppointmentDto = {
      officeId: null,
      patientId: null,
      date: "2026-04-01",
      hour: 10,
      status: AppointmentStatus.PLANNED,
      note: "Initial consultation",
    };

    it("should create and return appointment", async () => {
      repository.create.mockReturnValue(mockAppointment);
      repository.save.mockResolvedValue(mockAppointment);

      const result = await service.create(createDto);

      expect(result).toEqual(mockAppointment);
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockAppointment);
    });
  });
});
