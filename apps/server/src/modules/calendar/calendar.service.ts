import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { addDays, startOfWeek } from "date-fns";
import {
  CalendarAppointment,
  CalendarAppointmentPatient,
  CalendarDay,
  CalendarHourState,
} from "./dto/calendar.dto";
import { AppointmentService } from "../appointment/appointment.service";
import { AppointmentEntity } from "../appointment/appointment.entity";
import { PatientEntity } from "../patient/patient.entity";
import { OfficeEntity } from "../office/office.entity";
import { AuthUser } from "../../auth/strategies/jwt.strategy";
import { AuthHelper } from "../../common/helpers/AuthHelper";
import { SettingsService } from "../../common/services/settings.service";

type AppointmentMapKey = string & { __brand: "AppointmentMapKey" };

@Injectable()
export class CalendarService {
  constructor(
    private readonly appointmentService: AppointmentService,
    @InjectRepository(PatientEntity)
    private readonly patientRepository: Repository<PatientEntity>,
    @InjectRepository(OfficeEntity)
    private readonly officeRepository: Repository<OfficeEntity>,
    private readonly settingsService: SettingsService
  ) {}

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

  private mapPatientToDto(patient: PatientEntity): CalendarAppointmentPatient {
    return {
      id: patient.id,
      firstName: patient.user.firstName,
      lastName: patient.user.lastName,
      email: patient.user.email,
      phone: patient.phone,
      birthNumber: patient.birthNumber,
    };
  }

  private mapAppointmentForStaff(
    appointment: AppointmentEntity
  ): CalendarAppointment {
    return {
      id: appointment.id,
      note: appointment.note,
      patient: appointment.patient
        ? this.mapPatientToDto(appointment.patient)
        : undefined,
    };
  }

  private mapAppointmentForPatient(
    appointment: AppointmentEntity,
    patientId: string
  ): CalendarAppointment | undefined {
    if (appointment.patientId !== patientId) return undefined;

    return {
      id: appointment.id,
      note: appointment.note,
      patient: appointment.patient
        ? this.mapPatientToDto(appointment.patient)
        : undefined,
    };
  }

  async getWeek(
    officeId: string,
    date: Date,
    currentUser: AuthUser
  ): Promise<CalendarDay[]> {
    const { isStaff, isPatient } = AuthHelper.getRoles(currentUser);
    const { startingHour, endingHour } = this.settingsService.getOpeningHours();

    if (isStaff) {
      await AuthHelper.assertStaffBelongsToOffice(
        this.officeRepository,
        currentUser.id,
        officeId
      );
    }

    const monday = startOfWeek(date, { weekStartsOn: 1 });
    const dayLength = endingHour - startingHour;

    const appointments = await this.appointmentService.findByOfficeAndWeek(
      officeId,
      monday
    );
    const appointmentMap = this.mapAppointments(appointments);

    let patientId: string | undefined;
    if (isPatient) {
      const patient = await this.patientRepository.findOne({
        where: { userId: currentUser.id },
      });
      patientId = patient?.id;
    }

    return Array.from({ length: 7 }, (_, i) => {
      const currentDate = addDays(monday, i);
      const dateStr = this.formatDate(currentDate);

      return {
        date: dateStr,
        day: i,
        hours: Array.from({ length: dayLength }, (_, j) => {
          // ToDo: DRO: first check office.officeHourSchema, if date slot is available
          const hour = j + startingHour;
          const key = this.buildKey(dateStr, hour);
          const currentHourAppointment = appointmentMap.get(key);
          const state = currentHourAppointment
            ? CalendarHourState.BOOKED
            : CalendarHourState.AVAILABLE;

          let appointment: CalendarAppointment | undefined;
          if (currentHourAppointment) {
            if (isPatient && patientId) {
              appointment = this.mapAppointmentForPatient(
                currentHourAppointment,
                patientId
              );
            } else if (!isPatient) {
              // Staff and admin see full data
              appointment = this.mapAppointmentForStaff(currentHourAppointment);
            }
          }

          return { hour, state, appointment };
        }),
      };
    });
  }
}
