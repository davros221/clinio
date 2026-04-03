import { Patient } from "../dto/patient.dto";
import { PatientEntity } from "../patient.entity";

export class PatientMapper {
  static toDto(entity: PatientEntity): Patient {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      birthNumber: entity.birthNumber,
      birthdate: entity.birthdate,
      phone: entity.phone,
      email: entity.email,
    };
  }

  static toDtoList(entities: PatientEntity[]): Patient[] {
    return entities.map(this.toDto);
  }
}
