import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ForbiddenException } from "@nestjs/common";
import { Repository } from "typeorm";
import { CalendarService } from "../calendar.service";
import { AppointmentService } from "../../appointment/appointment.service";
import { AppointmentEntity } from "../../appointment/appointment.entity";
import { PatientEntity } from "../../patient/patient.entity";
import { OfficeEntity } from "../../office/office.entity";
import { CalendarHourState } from "../dto/calendar.dto";
import {
  AppointmentStatus,
  OfficeHoursTemplate,
  UserRole,
} from "@clinio/shared";
import { AuthUser } from "../../../auth/strategies/jwt.strategy";

const mockAppointmentService = () => ({
  findByOfficeAndWeek: jest.fn(),
});

const mockPatientRepository = () => ({
  findOne: jest.fn(),
});

const mockOfficeRepository = () => ({
  findOne: jest.fn(),
});

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

const adminUser: AuthUser = {
  id: "admin-1",
  email: "admin@test.com",
  role: UserRole.ADMIN,
};

const mockPatient: Partial<PatientEntity> = {
  id: "patient-1",
  userId: clientUser.id,
  user: {
    firstName: "Jan",
    lastName: "Novak",
    email: "jan@test.com",
  } as PatientEntity["user"],
  phone: "123456",
  birthNumber: "9001011234",
};

const otherPatient: Partial<PatientEntity> = {
  id: "patient-2",
  userId: "other-client",
  user: {
    firstName: "Eva",
    lastName: "Novakova",
    email: "eva@test.com",
  } as PatientEntity["user"],
  phone: "654321",
  birthNumber: "9501011234",
};

const weekdayHours: OfficeHoursTemplate = {
  monday: [{ from: 8, to: 16 }],
  tuesday: [{ from: 8, to: 16 }],
  wednesday: [{ from: 8, to: 16 }],
  thursday: [{ from: 8, to: 16 }],
  friday: [{ from: 8, to: 16 }],
  saturday: [],
  sunday: [],
};

const mockOffice: Partial<OfficeEntity> = {
  id: "office-uuid-001",
  staff: [{ id: doctorUser.id }] as OfficeEntity["staff"],
  officeHoursTemplate: weekdayHours,
};

describe("CalendarService", () => {
  let service: CalendarService;
  let appointmentService: jest.Mocked<
    Pick<AppointmentService, "findByOfficeAndWeek">
  >;
  let patientRepo: jest.Mocked<Pick<Repository<PatientEntity>, "findOne">>;
  let officeRepo: jest.Mocked<Pick<Repository<OfficeEntity>, "findOne">>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        {
          provide: AppointmentService,
          useFactory: mockAppointmentService,
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

    service = module.get<CalendarService>(CalendarService);
    appointmentService = module.get(AppointmentService);
    patientRepo = module.get(getRepositoryToken(PatientEntity));
    officeRepo = module.get(getRepositoryToken(OfficeEntity));
  });

  describe("getWeek", () => {
    const officeId = "office-uuid-001";
    // Use local date (Wednesday April 1, 2026) to avoid timezone issues with date-fns
    const wednesday = new Date(2026, 3, 1);

    it("should return 7 days starting from Monday", async () => {
      officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
      appointmentService.findByOfficeAndWeek.mockResolvedValue([]);

      const result = await service.getWeek(officeId, wednesday, adminUser);

      expect(result).toHaveLength(7);
      expect(result[0].day).toBe(0);
      expect(result[6].day).toBe(6);
    });

    it("should call appointmentService.findByOfficeAndWeek with officeId", async () => {
      officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
      appointmentService.findByOfficeAndWeek.mockResolvedValue([]);

      await service.getWeek(officeId, wednesday, adminUser);

      expect(appointmentService.findByOfficeAndWeek).toHaveBeenCalledWith(
        officeId,
        expect.any(Date)
      );
    });

    it("should return hour grid matching the office template (min 8 hours)", async () => {
      officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
      appointmentService.findByOfficeAndWeek.mockResolvedValue([]);

      const result = await service.getWeek(officeId, wednesday, adminUser);

      const hours = result[0].hours.map((h) => h.hour);
      expect(hours[0]).toBe(8);
      expect(hours[hours.length - 1]).toBe(15);
      expect(hours).toHaveLength(8);
    });

    it("should mark all hours on a closed day as CLOSED", async () => {
      officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
      appointmentService.findByOfficeAndWeek.mockResolvedValue([]);

      const result = await service.getWeek(officeId, wednesday, adminUser);

      // day 5 = Saturday, empty slots in template
      const saturday = result[5];
      expect(
        saturday.hours.every((h) => h.state === CalendarHourState.CLOSED)
      ).toBe(true);
    });

    it("should mark hours with appointments as BOOKED", async () => {
      officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
      appointmentService.findByOfficeAndWeek.mockResolvedValue([]);

      const emptyResult = await service.getWeek(officeId, wednesday, adminUser);
      const mondayDate = emptyResult[0].date;

      const appointment: AppointmentEntity = {
        id: "apt-1",
        officeId,
        office: null,
        patientId: mockPatient.id!,
        patient: mockPatient as PatientEntity,
        date: mondayDate,
        hour: 10,
        status: AppointmentStatus.PLANNED,
        note: "Checkup",
      };
      appointmentService.findByOfficeAndWeek.mockResolvedValue([appointment]);

      const result = await service.getWeek(officeId, wednesday, adminUser);

      const monday = result[0];
      const hour10 = monday.hours.find((h) => h.hour === 10);
      const hour11 = monday.hours.find((h) => h.hour === 11);

      expect(hour10?.state).toBe(CalendarHourState.BOOKED);
      expect(hour10?.appointment).toBeDefined();
      expect(hour11?.state).toBe(CalendarHourState.AVAILABLE);
    });

    describe("staff access", () => {
      it("should validate staff belongs to office", async () => {
        officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
        appointmentService.findByOfficeAndWeek.mockResolvedValue([]);

        await service.getWeek(officeId, wednesday, doctorUser);

        expect(officeRepo.findOne).toHaveBeenCalledWith({
          where: { id: officeId },
          relations: ["staff"],
        });
      });

      it("should throw ForbiddenException when staff does not belong to office", async () => {
        officeRepo.findOne.mockResolvedValue({
          ...mockOffice,
          staff: [{ id: "other-doctor" }],
        } as OfficeEntity);

        await expect(
          service.getWeek(officeId, wednesday, doctorUser)
        ).rejects.toThrow(ForbiddenException);
      });

      it("should return appointments with full patient data for staff", async () => {
        officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
        appointmentService.findByOfficeAndWeek.mockResolvedValue([]);

        const emptyResult = await service.getWeek(
          officeId,
          wednesday,
          doctorUser
        );
        const mondayDate = emptyResult[0].date;

        const appointment: AppointmentEntity = {
          id: "apt-1",
          officeId,
          office: null,
          patientId: mockPatient.id!,
          patient: mockPatient as PatientEntity,
          date: mondayDate,
          hour: 10,
          status: AppointmentStatus.PLANNED,
          note: "Checkup",
        };
        officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
        appointmentService.findByOfficeAndWeek.mockResolvedValue([appointment]);

        const result = await service.getWeek(officeId, wednesday, doctorUser);

        const hour10 = result[0].hours.find((h) => h.hour === 10);
        expect(hour10?.appointment?.patient).toEqual({
          id: mockPatient.id,
          firstName: "Jan",
          lastName: "Novak",
          email: "jan@test.com",
          phone: "123456",
          birthNumber: "9001011234",
        });
      });
    });

    describe("patient (CLIENT) access", () => {
      it("should return appointment data only for own appointments", async () => {
        officeRepo.findOne.mockResolvedValue(mockOffice as OfficeEntity);
        patientRepo.findOne.mockResolvedValue(mockPatient as PatientEntity);
        appointmentService.findByOfficeAndWeek.mockResolvedValue([]);

        const emptyResult = await service.getWeek(
          officeId,
          wednesday,
          clientUser
        );
        const mondayDate = emptyResult[0].date;

        const ownAppointment: AppointmentEntity = {
          id: "apt-1",
          officeId,
          office: null,
          patientId: mockPatient.id!,
          patient: mockPatient as PatientEntity,
          date: mondayDate,
          hour: 10,
          status: AppointmentStatus.PLANNED,
          note: "My checkup",
        };

        const otherAppointment: AppointmentEntity = {
          id: "apt-2",
          officeId,
          office: null,
          patientId: otherPatient.id!,
          patient: otherPatient as PatientEntity,
          date: mondayDate,
          hour: 11,
          status: AppointmentStatus.PLANNED,
          note: "Other checkup",
        };

        patientRepo.findOne.mockResolvedValue(mockPatient as PatientEntity);
        appointmentService.findByOfficeAndWeek.mockResolvedValue([
          ownAppointment,
          otherAppointment,
        ]);

        const result = await service.getWeek(officeId, wednesday, clientUser);

        const monday = result[0];
        const hour10 = monday.hours.find((h) => h.hour === 10);
        const hour11 = monday.hours.find((h) => h.hour === 11);

        // Own appointment — visible with data
        expect(hour10?.state).toBe(CalendarHourState.BOOKED);
        expect(hour10?.appointment).toBeDefined();
        expect(hour10?.appointment?.id).toBe("apt-1");

        // Other's appointment — BOOKED but no appointment data
        expect(hour11?.state).toBe(CalendarHourState.BOOKED);
        expect(hour11?.appointment).toBeUndefined();
      });
    });
  });
});
