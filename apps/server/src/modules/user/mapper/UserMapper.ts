import { User } from "../dto/user.dto";
import { UserEntity } from "../user.entity";

export class UserMapper {
  static toDto(user: UserEntity): User {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  static toDtoList(users: UserEntity[]): User[] {
    return users.map(this.toDto);
  }
}
