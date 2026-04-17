import { User } from "../dto/user.dto";
import { UserEntity } from "../user.entity";
import { AuthData } from "../../../auth/dto/auth-response.dto";

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

  static toAuthData(user: UserEntity): AuthData {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }
}
