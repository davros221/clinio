import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ErrorCode, UserRole, type UserListQuery } from "@clinio/shared";
import { UserEntity } from "./user.entity";
import { PatientEntity } from "../patient/patient.entity";
import {
  DataSource,
  In,
  ILike,
  Repository,
  type FindOptionsWhere,
} from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import {
  accountNotActive,
  badRequest,
  emailAlreadyExists,
  forbidden,
  internalError,
  notFound,
} from "../../common/error-messages";
import { AuthUser } from "../../auth/strategies/jwt.strategy";
import * as bcrypt from "bcryptjs";
import { AuthHelper } from "../../common/helpers/AuthHelper";

const ADMIN_ONLY_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.DOCTOR,
  UserRole.NURSE,
];

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private dataSource: DataSource
  ) {}

  async findAll(
    currentUser: AuthUser,
    roles: UserRole[],
    query: UserListQuery,
    search?: string
  ): Promise<{ items: UserEntity[]; total: number }> {
    const { isAdmin, isStaff } = AuthHelper.getRoles(currentUser);
    const requestingStaff = roles.some((r) => ADMIN_ONLY_ROLES.includes(r));
    const requestingPatients = roles.includes(UserRole.CLIENT);

    if (requestingStaff && !isAdmin) {
      throw forbidden();
    }

    if (requestingPatients && isAdmin) {
      throw forbidden();
    }

    if (requestingPatients && !isStaff) {
      throw forbidden();
    }

    const baseWhere: FindOptionsWhere<UserEntity> = { role: In(roles) };

    let where: FindOptionsWhere<UserEntity> | FindOptionsWhere<UserEntity>[];
    if (search) {
      const pattern = ILike(`%${search}%`);
      where = [
        { ...baseWhere, firstName: pattern },
        { ...baseWhere, lastName: pattern },
      ];
    } else {
      where = baseWhere;
    }

    // TODO: DOCTOR and NURSE should only see their own patients (via office relation)
    const [items, total] = await this.userRepository.findAndCount({
      where,
      order: { [query.sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return { items, total };
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

  async findByResetToken(token: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ resetToken: token });
  }

  /**
   * CREATE USER
   *
   * @param user
   * @param currentUser
   */
  async create(
    user: CreateUserDto,
    currentUser?: AuthUser
  ): Promise<UserEntity> {
    if (currentUser) {
      this.validateAuthenticatedCreate(user, currentUser);
    } else {
      this.validatePublicCreate(user);
    }

    // Unique email is checked by database, but system should return a standardized error message
    const existingUser = await this.findByEmail(user.email);
    if (existingUser) {
      if (!existingUser.password) {
        throw accountNotActive();
      }
      throw emailAlreadyExists();
    }

    const hashedPassword = user.password
      ? await bcrypt.hash(user.password, 10)
      : undefined;

    return this.dataSource.transaction(async (manager) => {
      const newUser = manager.create(UserEntity, {
        ...user,
        password: hashedPassword,
      });
      const savedUser = await manager.save(newUser);

      if (user.role === UserRole.CLIENT) {
        const patient = manager.create(PatientEntity, {
          userId: savedUser.id,
          birthNumber: user.birthNumber!,
          birthdate: user.birthdate!,
          phone: user.phone!,
        });
        await manager.save(patient);
      }

      return savedUser;
    });
  }

  /**
   * Global validation logic for creating new user account when request is made by authenticated user (Admin, Doctor or Nurse)
   *
   * @param user
   * @param currentUser
   * @private
   */
  private validateAuthenticatedCreate(
    user: CreateUserDto,
    currentUser: AuthUser
  ): void {
    const { isAdmin, isStaff } = AuthHelper.getRoles(currentUser);

    if (isAdmin) {
      this.validateAdminCreate(user);
    } else if (isStaff) {
      this.validateStaffCreate(user);
    } else {
      throw forbidden();
    }
  }

  /**
   * Validation logic for creating new user as Admin
   *  - Admin can create new user account ONLY for Doctor or Nurse
   * @param user
   * @private
   */
  private validateAdminCreate(user: CreateUserDto): void {
    if (user.role !== UserRole.DOCTOR && user.role !== UserRole.NURSE) {
      throw forbidden();
    }
    // ToDo: Admin shouldn't create password for staff account, there should be some mechanic for doctor / nurse to set their password
    if (!user.password) {
      throw badRequest("Admin must provide password for new user account.");
    }
  }

  /**
   * Validation logic for createing new user as Office staff (Doctor or Nurse)
   *  - Staff can create new user account WITHOUT password (non-authenticable account)
   *  - Later, patients will be able to activate their account and set password
   * @param user
   * @private
   */
  private validateStaffCreate(user: CreateUserDto): void {
    if (user.role !== UserRole.CLIENT) {
      throw forbidden();
    }
    if (user.password) {
      throw badRequest("Staff cannot create user account with a password.");
    }
  }

  /**
   * Validation logic for creating new user as public user
   *  - creating new user by public user means self-registration, so password is required
   * @param user
   * @private
   */
  private validatePublicCreate(user: CreateUserDto): void {
    if (user.role !== UserRole.CLIENT) {
      throw forbidden();
    }
    if (!user.password) {
      throw badRequest("Password is required for self-registration.");
    }
  }

  /**
   * Delete user by id
   * Admin can delete every other account, other users can delete only their own account
   * @param id
   * @param currentUser
   */
  async remove(id: string, currentUser: AuthUser): Promise<void> {
    const { isAdmin } = AuthHelper.getRoles(currentUser);

    if (isAdmin && id === currentUser.id) {
      throw badRequest("Admin cannot remove own account.");
    } else if (!isAdmin && id !== currentUser.id) {
      throw forbidden();
    }

    await this.userRepository.delete(id);
  }

  /**
   * Do not expose to controller
   * @param user
   */
  public async update(user: UserEntity): Promise<UserEntity> {
    return await this.userRepository.save(user);
  }
}
