import { Injectable } from "@nestjs/common";
import { addDays, startOfWeek } from "date-fns";
import { CalendarAppointment, CalendarDay, CalendarHourState } from "./dto/calendar.dto";
import { AppointmentService } from "../appointment/appointment.service";
import { AppointmentEntity } from "../appointment/appointment.entity";

type AppointmentMapKey = string & { __brand: "AppointmentMapKey" };

@Injectable()
export class CalendarService {
  // ToDo: This will be fetched from office settings
  private readonly startingHour = 6;
  private readonly endingHour = 20;

  constructor(private readonly appointmentService: AppointmentService) {}

  private buildKey(date: string, hour: number): AppointmentMapKey {
    return `${date}-${hour}` as AppointmentMapKey;
  }

  /**
   * Format Date to "yyyy-MM-dd" string in UTC to avoid timezone shifts
   */
  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private mapAppointments(appointments: AppointmentEntity[]) {
    const appointmentMap: Map<AppointmentMapKey, AppointmentEntity> = new Map();
    appointments.forEach((appointment) => {
      const key = this.buildKey(appointment.date, appointment.hour);
      appointmentMap.set(key, appointment);
    });
    return appointmentMap;
  }

  private mapAppointmentToCalendarAppointment(appointment?: AppointmentEntity): CalendarAppointment | undefined {
    if (!appointment) return undefined;
    return {
      // ToDO: DRO - when patient module ready, add patient
      patient: undefined,
      id: appointment.id,
      doctor: undefined,
      isOwned: true,
      note: appointment.note,
    };
  }

  async getWeek(officeId: string, date: Date): Promise<CalendarDay[]> {
    const monday = startOfWeek(date, { weekStartsOn: 1 });
    const dayLength = this.endingHour - this.startingHour;

    const appointments = await this.appointmentService.findByOfficeAndWeek(officeId, monday);
    const appointmentMap = this.mapAppointments(appointments);

    return Array.from({ length: 7 }, (_, i) => {
      const currentDate = addDays(monday, i);
      const dateStr = this.formatDate(currentDate);

      return {
        date: dateStr,
        day: i,
        hours: Array.from({ length: dayLength }, (_, j) => {
          // ToDo: DRO: first check office.officeHourSchema, if date slot is available
          const hour = j + this.startingHour;
          const key = this.buildKey(dateStr, hour);
          const currentHourAppointment = appointmentMap.get(key);
          const state = currentHourAppointment ? CalendarHourState.BOOKED : CalendarHourState.AVAILABLE;

          return {
            hour,
            state,
            appointment: this.mapAppointmentToCalendarAppointment(currentHourAppointment),
          };
        }),
      };
    });
  }
}
