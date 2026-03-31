import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { AppointmentService } from "../appointment.service";
import { AppointmentEntity } from "../appointment.entity";
import { AppointmentStatus, ErrorCode } from "@clinio/shared";
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

const mockAppointmentRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe("AppointmentService", () => {
  let service: AppointmentService;
  let repository: jest.Mocked<
    Pick<Repository<AppointmentEntity>, "find" | "findOne" | "create" | "save">
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
    it("should return all appointments with office relation", async () => {
      repository.find.mockResolvedValue([mockAppointment]);

      const result = await service.findAll();

      expect(result).toEqual([mockAppointment]);
      expect(repository.find).toHaveBeenCalledWith({
        relations: ["office"],
      });
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
