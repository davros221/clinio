import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ErrorCode } from "@clinio/shared";
import { UserEntity } from "./user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import {
  emailAlreadyExists,
  internalError,
  notFound,
} from "../../common/error-messages";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>
  ) {}

  findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
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
