import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { addDays, format, startOfWeek } from "date-fns";
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
import { OfficeHoursHelper } from "../../common/helpers/OfficeHoursHelper";
import { notFound } from "../../common/error-messages";

type AppointmentMapKey = string & { __brand: "AppointmentMapKey" };

@Injectable()
export class CalendarService {
  constructor(
    private readonly appointmentService: AppointmentService,
    @InjectRepository(PatientEntity)
    private readonly patientRepository: Repository<PatientEntity>,
    @InjectRepository(OfficeEntity)
    private readonly officeRepository: Repository<OfficeEntity>
  ) {}

  private buildKey(date: string, hour: number): AppointmentMapKey {
    return `${date}-${hour}` as AppointmentMapKey;
  }

  private formatDate(date: Date): string {
    return format(date, "yyyy-MM-dd");
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

    const office = await this.officeRepository.findOne({
      where: { id: officeId },
      relations: ["staff"],
    });
    if (!office) {
      throw notFound("Office");
    }

    if (isStaff) {
      AuthHelper.assertStaffBelongsToOfficeEntity(office, currentUser.id);
    }

    const monday = startOfWeek(date, { weekStartsOn: 1 });
    const { start, end } = OfficeHoursHelper.computeGridRange(
      office.officeHoursTemplate
    );
    const dayLength = end - start;

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
      const slots = OfficeHoursHelper.getSlotsForDate(
        office.officeHoursTemplate,
        dateStr
      );

      return {
        date: dateStr,
        day: i,
        hours: Array.from({ length: dayLength }, (_, j) => {
          const hour = j + start;
          const isOpen = OfficeHoursHelper.isHourOpen(slots, hour);

          if (!isOpen) {
            return { hour, state: CalendarHourState.CLOSED };
          }

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
              appointment = this.mapAppointmentForStaff(currentHourAppointment);
            }
          }

          return { hour, state, appointment };
        }),
      };
    });
  }
}
