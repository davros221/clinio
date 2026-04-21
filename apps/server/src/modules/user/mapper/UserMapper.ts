import { User } from "../dto/user.dto";
import { UserEntity } from "../user.entity";
import { AuthData, AuthPatient } from "../../../auth/dto/auth-response.dto";
import { PatientEntity } from "../../patient/patient.entity";

export class UserMapper {
  static toDto(user: UserEntity): User {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  static toDtoList(users: UserEntity[]): User[] {
    return users.map(this.toDto);
  }

  static toAuthData(
    user: UserEntity,
    patient?: PatientEntity | null
  ): AuthData {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      patient: patient ? UserMapper.toAuthPatient(patient) : null,
    };
  }

  private static toAuthPatient(patient: PatientEntity): AuthPatient {
    return {
      id: patient.id,
      birthNumber: patient.birthNumber,
      birthdate: patient.birthdate,
      phone: patient.phone,
    };
  }
}
