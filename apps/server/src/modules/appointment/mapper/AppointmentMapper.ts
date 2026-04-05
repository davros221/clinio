import { Appointment } from "../dto/appointment.dto";
import { AppointmentEntity } from "../appointment.entity";

export class AppointmentMapper {
  static toDto(entity: AppointmentEntity): Appointment {
    return {
      id: entity.id,
      officeId: entity.officeId,
      patientId: entity.patientId,
      date: entity.date,
      hour: entity.hour,
      status: entity.status,
      note: entity.note,
    };
  }

  static toDtoList(entities: AppointmentEntity[]): Appointment[] {
    return entities.map(this.toDto);
  }
}
