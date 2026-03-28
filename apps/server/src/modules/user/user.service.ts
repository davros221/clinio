import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ErrorCode, UserRole } from "@clinio/shared";
import { UserEntity } from "./user.entity";
import { In, Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import {
  emailAlreadyExists,
  forbidden,
  internalError,
  notFound,
} from "../../common/error-messages";
import { AuthUser } from "../../auth/strategies/jwt.strategy";
import * as bcrypt from "bcryptjs";

const ADMIN_ONLY_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.DOCTOR,
  UserRole.NURSE,
];

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>
  ) {}

  async findAll(
    currentUser: AuthUser,
    roles: UserRole[]
  ): Promise<UserEntity[]> {
    const requestingStaff = roles.some((r) => ADMIN_ONLY_ROLES.includes(r));
    const requestingPatients = roles.includes(UserRole.CLIENT);

    if (requestingStaff && currentUser.role !== UserRole.ADMIN) {
      throw forbidden();
    }

    if (requestingPatients && currentUser.role === UserRole.ADMIN) {
      throw forbidden();
    }

    if (
      requestingPatients &&
      currentUser.role !== UserRole.DOCTOR &&
      currentUser.role !== UserRole.NURSE
    ) {
      throw forbidden();
    }

    // TODO: DOCTOR and NURSE should only see their own patients (via office relation)
    return this.userRepository.find({ where: { role: In(roles) } });
  }

  async findById(id: string): Promise<UserEntity> {
    let user: UserEntity | null;

    try {
      user = await this.userRepository.findOneBy({ id });
    } catch {
      throw internalError();
    }

    if (!user) {
      throw notFound("User", ErrorCode.USER_NOT_FOUND);
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ email });
  }

  async create(user: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.findByEmail(user.email);
    if (existingUser) {
      throw emailAlreadyExists();
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = this.userRepository.create({
      ...user,
      password: hashedPassword,
    });
    return this.userRepository.save(newUser);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
