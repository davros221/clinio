import { Test, TestingModule } from "@nestjs/testing";
import { CalendarService } from "../calendar.service";
import { AppointmentService } from "../../appointment/appointment.service";
import { AppointmentEntity } from "../../appointment/appointment.entity";
import { CalendarHourState } from "../dto/calendar.dto";
import { AppointmentStatus } from "@clinio/shared";

const mockAppointmentService = () => ({
  findByOfficeAndWeek: jest.fn(),
});

describe("CalendarService", () => {
  let service: CalendarService;
  let appointmentService: jest.Mocked<Pick<AppointmentService, "findByOfficeAndWeek">>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        {
          provide: AppointmentService,
          useFactory: mockAppointmentService,
        },
      ],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
    appointmentService = module.get(AppointmentService);
  });

  describe("getWeek", () => {
    const officeId = "office-uuid-001";
    // Use local date (Wednesday April 1, 2026) to avoid timezone issues with date-fns
    const wednesday = new Date(2026, 3, 1);

    it("should return 7 days starting from Monday", async () => {
      appointmentService.findByOfficeAndWeek.mockResolvedValue([]);

      const result = await service.getWeek(officeId, wednesday);

      expect(result).toHaveLength(7);
      expect(result[0].day).toBe(0);
      expect(result[6].day).toBe(6);
    });

    it("should call appointmentService.findByOfficeAndWeek with officeId", async () => {
      appointmentService.findByOfficeAndWeek.mockResolvedValue([]);

      await service.getWeek(officeId, wednesday);

      expect(appointmentService.findByOfficeAndWeek).toHaveBeenCalledWith(officeId, expect.any(Date));
    });

    it("should mark hours with appointments as BOOKED", async () => {
      appointmentService.findByOfficeAndWeek.mockResolvedValue([]);

      // Get the actual Monday date string the service would produce
      const emptyResult = await service.getWeek(officeId, wednesday);
      const mondayDate = emptyResult[0].date;

      const appointment: AppointmentEntity = {
        id: "apt-1",
        officeId,
        office: null,
        patientId: null,
        date: mondayDate,
        hour: 10,
        status: AppointmentStatus.PLANNED,
        note: "Checkup",
      };
      appointmentService.findByOfficeAndWeek.mockResolvedValue([appointment]);

      const result = await service.getWeek(officeId, wednesday);

      const monday = result[0];
      const hour10 = monday.hours.find((h) => h.hour === 10);
      const hour11 = monday.hours.find((h) => h.hour === 11);

      expect(hour10?.state).toBe(CalendarHourState.BOOKED);
      expect(hour10?.appointment).toBeDefined();
      expect(hour11?.state).toBe(CalendarHourState.AVAILABLE);
    });

    it("should return hours from 6 to 19", async () => {
      appointmentService.findByOfficeAndWeek.mockResolvedValue([]);

      const result = await service.getWeek(officeId, wednesday);

      const hours = result[0].hours.map((h) => h.hour);
      expect(hours[0]).toBe(6);
      expect(hours[hours.length - 1]).toBe(19);
      expect(hours).toHaveLength(14);
    });
  });
});
