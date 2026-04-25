import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  ErrorCode,
  PatientSortField,
  type PatientListQuery,
} from "@clinio/shared";
import { PatientEntity } from "./patient.entity";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import {
  forbidden,
  internalError,
  notFound,
} from "../../common/error-messages";
import { AuthUser } from "../../auth/strategies/jwt.strategy";
import { AuthHelper } from "../../common/helpers/AuthHelper";

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(PatientEntity)
    private patientRepository: Repository<PatientEntity>
  ) {}

  async findAll(
    query: PatientListQuery,
    search?: string
  ): Promise<{ items: PatientEntity[]; total: number }> {
    const qb = this.patientRepository
      .createQueryBuilder("patient")
      .innerJoinAndSelect("patient.user", "user");

    if (search) {
      qb.where("user.firstName ILIKE :search OR user.lastName ILIKE :search", {
        search: `%${search}%`,
      });
    }

    const sortColumn =
      query.sortBy === PatientSortField.LAST_NAME
        ? "user.lastName"
        : `patient.${query.sortBy}`;

    qb.orderBy(sortColumn, query.sortOrder)
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findByUserId(userId: string): Promise<PatientEntity | null> {
    return this.patientRepository.findOne({ where: { userId } });
  }

  async findById(id: string, currentUser?: AuthUser): Promise<PatientEntity> {
    let patient: PatientEntity | null;
    try {
      patient = await this.patientRepository.findOne({ where: { id } });
    } catch {
      throw internalError();
    }

    if (!patient) {
      throw notFound("Patient", ErrorCode.PATIENT_NOT_FOUND);
    }

    if (currentUser) {
      this.assertAccess(patient, currentUser);
    }

    return patient;
  }

  async update(
    id: string,
    dto: UpdatePatientDto,
    currentUser: AuthUser
  ): Promise<PatientEntity> {
    const patient = await this.findById(id, currentUser);
    Object.assign(patient, dto);
    return this.patientRepository.save(patient);
  }

  async delete(id: string, user: AuthUser): Promise<void> {
    const { isStaff } = AuthHelper.getRoles(user);
    if (!isStaff) {
      throw forbidden();
    }

    const patient = await this.findById(id, user);
    await this.patientRepository.remove(patient);
  }

  private assertAccess(patient: PatientEntity, currentUser: AuthUser): void {
    const { isStaff } = AuthHelper.getRoles(currentUser);
    if (isStaff) return;

    if (patient.userId !== currentUser.id) {
      throw forbidden();
    }
  }
}
