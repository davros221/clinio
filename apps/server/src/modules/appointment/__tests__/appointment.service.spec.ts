import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { AppointmentService } from "../appointment.service";
import { AppointmentEntity } from "../appointment.entity";
import { PatientEntity } from "../../patient/patient.entity";
import { OfficeEntity } from "../../office/office.entity";
import {
  AppointmentStatus,
  AppointmentSortField,
  SortOrder,
  ErrorCode,
  UserRole,
} from "@clinio/shared";
import { CreateAppointmentDto } from "../dto/create-appointment.dto";
import { AuthUser } from "../../../auth/strategies/jwt.strategy";
import { OfficeHoursTemplate } from "@clinio/shared";

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

const clientUser: AuthUser = {
  id: "client-1",
  email: "client@test.com",
  role: UserRole.CLIENT,
};

const mockPatient: Partial<PatientEntity> = {
  id: "patient-1",
  userId: clientUser.id,
  birthNumber: "9001011234",
  birthdate: new Date("1990-01-01"),
  phone: "+420123456789",
};

const mockAppointment: AppointmentEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  officeId: "office-1",
  office: null,
  patientId: "patient-1",
  patient: mockPatient as PatientEntity,
  date: "2026-04-01",
  hour: 10,
  status: AppointmentStatus.PLANNED,
  note: "Initial consultation",
};

const fullWeekHours: OfficeHoursTemplate = {
  monday: [{ from: 8, to: 16 }],
  tuesday: [{ from: 8, to: 16 }],
  wednesday: [{ from: 8, to: 16 }],
  thursday: [{ from: 8, to: 16 }],
  friday: [{ from: 8, to: 16 }],
  saturday: [],
  sunday: [],
};

const mockOffice: Partial<OfficeEntity> = {
  id: "office-1",
  staff: [{ id: doctorUser.id }] as OfficeEntity["staff"],
  officeHoursTemplate: fullWeekHours,
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

const mockPatientRepository = () => ({
  findOne: jest.fn(),
});

const mockOfficeRepository = () => ({
  findOne: jest.fn(),
});

describe("AppointmentService", () => {
  let service: AppointmentService;
  let appointmentRepo: jest.Mocked<
    Pick<
      Repository<AppointmentEntity>,
      "find" | "findAndCount" | "findOne" | "create" | "save"
    >
  >;
  let patientRepo: jest.Mocked<Pick<Repository<PatientEntity>, "findOne">>;
  let officeRepo: jest.Mocked<Pick<Repository<OfficeEntity>, "findOne">>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: getRepositoryToken(AppointmentEntity),
          useFactory: mockAppointmentRepository,
        },
        {
          provide: getRepositoryToken(PatientEntity),
          useFactory: mockPatientRepository,
        },
        {
          provide: getRepositoryToken(OfficeEntity),
          useFactory: mockOfficeRepository,
        },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    appointmentRepo = module.get(getRepositoryToken(AppointmentEntity));
    patientRepo = module.get(getRepositoryToken(PatientEntity));
    officeRepo = module.get(getRepositoryToken(OfficeEntity));
  });

  describe("findAll", () => {
    it("should return all appointments for admin", async () => {
      appointmentRepo.findAndCount.mockResolvedValue([[mockAppointment], 1]);

      const result = await service.findAll(defaultQuery, adminUser);

      expect(result).toEqual({ items: [mockAppointment], total: 1 });
      expect(appointmentRepo.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: ["office", "patient", "patient.user"],
        order: { date: "ASC" },
        skip: 0,
        take: 20,
      });
    });

    it("should filter by statuses for admin", async () => {
      appointmentRepo.findAndCount.mockResolvedValue([[mockAppointment], 1]);

      await service.findAll(defaultQuery, adminUser, [
        AppointmentStatus.PLANNED,
      ]);

      expect(appointmentRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: expect.anything() },
        })
      );
    });

    describe("patient (CLIENT)", () => {
      it("should return only patient's own appointments", async () => {
        patientRepo.findOne.mockResolvedValue(mockPatient as PatientEntity);
        appointmentRepo.findAndCount.mockResolvedValue([[mockAppointment], 1]);

        const result = await service.findAll(defaultQuery, clientUser);

        expect(result).toEqual({ items: [mockAppointment], total: 1 });
        expect(patientRepo.findOne).toHaveBeenCalledWith({
          where: { userId: clientUser.id },
        });
        expect(appointmentRepo.findAndCount).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { patientId: mockPatient.id },
          })
        );
      });

      it("should throw NotFoundException when patient entity not found", async () => {
        patientRepo.findOne.mockResolvedValue(null);

        try {
          await service.findAll(defaultQuery, clientUser);
          fail("should have thrown");
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
          expect((error as NotFoundException).getResponse()).toMatchObject({
            errorCode: ErrorCode.NOT_FOUND,
          });
        }
      });
    });

    describe("staff (DOCTOR/NURSE)", () => {
      it("should filter by officeId and validate staff membership", async () => {
        officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
        appointmentRepo.findAndCount.mockResolvedValue([[mockAppointment], 1]);

        const result = await service.findAll(
          defaultQuery,
          doctorUser,
          undefined,
          "office-1"
        );

        expect(result).toEqual({ items: [mockAppointment], total: 1 });
        expect(officeRepo.findOne).toHaveBeenCalledWith({
          where: { id: "office-1" },
          relations: ["staff"],
        });
        expect(appointmentRepo.findAndCount).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { officeId: "office-1" },
          })
        );
      });

      it("should throw ForbiddenException when officeId not provided", async () => {
        await expect(service.findAll(defaultQuery, doctorUser)).rejects.toThrow(
          ForbiddenException
        );
      });

      it("should throw ForbiddenException when staff does not belong to office", async () => {
        officeRepo.findOne.mockResolvedValue({
          ...mockOffice,
          staff: [{ id: "other-doctor" }],
        } as OfficeEntity);

        await expect(
          service.findAll(defaultQuery, doctorUser, undefined, "office-1")
        ).rejects.toThrow(ForbiddenException);
      });
    });
  });

  describe("findById", () => {
    it("should return appointment for admin", async () => {
      appointmentRepo.findOne.mockResolvedValue(mockAppointment);

      const result = await service.findById(mockAppointment.id, adminUser);

      expect(result).toEqual(mockAppointment);
      expect(appointmentRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockAppointment.id },
        relations: ["office", "patient", "patient.user"],
      });
    });

    it("should return appointment for patient who belongs to it", async () => {
      appointmentRepo.findOne.mockResolvedValue(mockAppointment);
      patientRepo.findOne.mockResolvedValue(mockPatient as PatientEntity);

      const result = await service.findById(mockAppointment.id, clientUser);

      expect(result).toEqual(mockAppointment);
    });

    it("should throw ForbiddenException for patient who does not belong to appointment", async () => {
      appointmentRepo.findOne.mockResolvedValue({
        ...mockAppointment,
        patientId: "other-patient",
      });
      patientRepo.findOne.mockResolvedValue(mockPatient as PatientEntity);

      await expect(
        service.findById(mockAppointment.id, clientUser)
      ).rejects.toThrow(ForbiddenException);
    });

    it("should return appointment for staff belonging to the office", async () => {
      appointmentRepo.findOne.mockResolvedValue(mockAppointment);
      officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);

      const result = await service.findById(mockAppointment.id, doctorUser);

      expect(result).toEqual(mockAppointment);
    });

    it("should throw ForbiddenException for staff not belonging to the office", async () => {
      appointmentRepo.findOne.mockResolvedValue(mockAppointment);
      officeRepo.findOne.mockResolvedValue({
        ...mockOffice,
        staff: [{ id: "other-doctor" }],
      } as OfficeEntity);

      await expect(
        service.findById(mockAppointment.id, doctorUser)
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw NotFoundException when appointment not found", async () => {
      appointmentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findById("non-existent-id", adminUser)
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException with APPOINTMENT_NOT_FOUND error code", async () => {
      appointmentRepo.findOne.mockResolvedValue(null);

      try {
        await service.findById("non-existent-id", adminUser);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect((error as NotFoundException).getResponse()).toMatchObject({
          errorCode: ErrorCode.APPOINTMENT_NOT_FOUND,
        });
      }
    });

    it("should throw InternalServerErrorException when repository throws", async () => {
      appointmentRepo.findOne.mockRejectedValue(new Error("DB error"));

      try {
        await service.findById(mockAppointment.id, adminUser);
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
      appointmentRepo.find.mockResolvedValue([mockAppointment]);

      const weekStart = new Date("2026-03-30T00:00:00.000Z");
      const result = await service.findByOfficeAndWeek("office-1", weekStart);

      expect(result).toEqual([mockAppointment]);
      expect(appointmentRepo.find).toHaveBeenCalledWith({
        where: {
          officeId: "office-1",
          date: expect.anything(),
        },
        relations: ["patient", "patient.user"],
      });
    });
  });

  describe("create", () => {
    const createDto: CreateAppointmentDto = {
      officeId: "office-1",
      date: "2026-04-01",
      hour: 10,
      status: AppointmentStatus.PLANNED,
      note: "Initial consultation",
    };

    it("should create and return appointment for admin", async () => {
      officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
      appointmentRepo.findOne.mockResolvedValue(null); // no existing slot
      appointmentRepo.create.mockReturnValue(mockAppointment);
      appointmentRepo.save.mockResolvedValue(mockAppointment);

      const result = await service.create(createDto, adminUser);

      expect(result).toEqual(mockAppointment);
      expect(appointmentRepo.create).toHaveBeenCalledWith(createDto);
      expect(appointmentRepo.save).toHaveBeenCalledWith(mockAppointment);
    });

    it("should throw NotFoundException when office does not exist", async () => {
      officeRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, adminUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it("should validate staff belongs to office when doctor creates", async () => {
      const staffDto = { ...createDto, patientId: "patient-1" };
      officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
      appointmentRepo.findOne.mockResolvedValue(null);
      appointmentRepo.create.mockReturnValue(mockAppointment);
      appointmentRepo.save.mockResolvedValue(mockAppointment);

      await service.create(staffDto, doctorUser);

      expect(officeRepo.findOne).toHaveBeenCalledWith({
        where: { id: "office-1" },
        relations: ["staff"],
      });
    });

    it("should throw BadRequestException when staff creates without patientId", async () => {
      officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);

      await expect(service.create(createDto, doctorUser)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw ForbiddenException when doctor does not belong to office", async () => {
      officeRepo.findOne.mockResolvedValue({
        ...mockOffice,
        staff: [{ id: "other-doctor" }],
      } as OfficeEntity);

      await expect(service.create(createDto, doctorUser)).rejects.toThrow(
        ForbiddenException
      );
    });

    it("should allow client to create appointment for any office", async () => {
      officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
      appointmentRepo.findOne.mockResolvedValue(null);
      patientRepo.findOne.mockResolvedValue(mockPatient as PatientEntity);
      appointmentRepo.create.mockReturnValue(mockAppointment);
      appointmentRepo.save.mockResolvedValue(mockAppointment);

      const result = await service.create(createDto, clientUser);

      expect(result).toEqual(mockAppointment);
      expect(patientRepo.findOne).toHaveBeenCalledWith({
        where: { userId: clientUser.id },
      });
    });

    it("should throw NotFoundException when client has no patient record", async () => {
      officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
      appointmentRepo.findOne.mockResolvedValue(null);
      patientRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, clientUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it.each([
      ["birthNumber", { birthNumber: null }],
      ["birthdate", { birthdate: null }],
      ["phone", { phone: null }],
    ])(
      "should throw PATIENT_PROFILE_INCOMPLETE when client missing %s",
      async (_field, missing) => {
        const incomplete = { ...mockPatient, ...missing } as PatientEntity;
        appointmentRepo.findOne.mockResolvedValue(null);
        patientRepo.findOne.mockResolvedValue(incomplete);

        try {
          await service.create(createDto, clientUser);
          fail("should have thrown");
        } catch (error) {
          expect(error).toBeInstanceOf(ForbiddenException);
          expect((error as ForbiddenException).getResponse()).toMatchObject({
            errorCode: ErrorCode.PATIENT_PROFILE_INCOMPLETE,
          });
        }
      }
    );

    it("should throw BadRequestException when hour is outside office hours for the weekday", async () => {
      // 2026-04-01 is Wednesday; template has 8-16; hour 5 is outside
      officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
      const dto: CreateAppointmentDto = { ...createDto, hour: 5 };

      await expect(service.create(dto, adminUser)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw BadRequestException when the weekday is closed", async () => {
      // 2026-04-04 is Saturday; template has empty slots for Saturday
      officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
      const dto: CreateAppointmentDto = { ...createDto, date: "2026-04-04" };

      await expect(service.create(dto, adminUser)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw BadRequestException with APPOINTMENT_OUTSIDE_HOURS error code", async () => {
      officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
      const dto: CreateAppointmentDto = { ...createDto, hour: 21 };

      try {
        await service.create(dto, adminUser);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect((error as BadRequestException).getResponse()).toMatchObject({
          errorCode: ErrorCode.APPOINTMENT_OUTSIDE_HOURS,
        });
      }
    });

    it("should throw ConflictException when slot is already taken", async () => {
      officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
      appointmentRepo.findOne.mockResolvedValue(mockAppointment);

      await expect(service.create(createDto, adminUser)).rejects.toThrow(
        ConflictException
      );
    });

    it("should throw ConflictException with APPOINTMENT_SLOT_TAKEN error code", async () => {
      officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
      appointmentRepo.findOne.mockResolvedValue(mockAppointment);

      try {
        await service.create(createDto, adminUser);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect((error as ConflictException).getResponse()).toMatchObject({
          errorCode: ErrorCode.APPOINTMENT_SLOT_TAKEN,
        });
      }
    });

    it("should allow creating appointment when existing slot is cancelled", async () => {
      officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
      appointmentRepo.findOne.mockResolvedValue(null); // Not(CANCELLED) returns no match
      appointmentRepo.create.mockReturnValue(mockAppointment);
      appointmentRepo.save.mockResolvedValue(mockAppointment);

      const result = await service.create(createDto, adminUser);

      expect(result).toEqual(mockAppointment);
    });
  });
});
