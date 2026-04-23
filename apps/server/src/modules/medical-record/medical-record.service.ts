import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { type MedicalRecordListQuery } from "@clinio/shared";
import { MedicalRecordEntity } from "./medical-record.entity";
import { OfficeEntity } from "../office/office.entity";
import { PatientEntity } from "../patient/patient.entity";
import { CreateMedicalRecordDto } from "./dto/create-medical-record.dto";
import {
  forbidden,
  internalError,
  medicalRecordNotFound,
  notFound,
} from "../../common/error-messages";
import { AuthUser } from "../../auth/strategies/jwt.strategy";
import { AuthHelper } from "../../common/helpers/AuthHelper";

@Injectable()
export class MedicalRecordService {
  constructor(
    @InjectRepository(MedicalRecordEntity)
    private medicalRecordRepository: Repository<MedicalRecordEntity>,
    @InjectRepository(PatientEntity)
    private patientRepository: Repository<PatientEntity>,
    @InjectRepository(OfficeEntity)
    private officeRepository: Repository<OfficeEntity>
  ) {}

  async findAllForPatient(
    patientId: string,
    query: MedicalRecordListQuery,
    currentUser: AuthUser
  ): Promise<{ items: MedicalRecordEntity[]; total: number }> {
    await this.assertPatientAccess(patientId, currentUser);

    const [items, total] = await this.medicalRecordRepository.findAndCount({
      where: { patientId },
      relations: ["patient", "patient.user", "creator", "office"],
      order: { [query.sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return { items, total };
  }

  async findById(
    patientId: string,
    id: string,
    currentUser: AuthUser
  ): Promise<MedicalRecordEntity> {
    await this.assertPatientAccess(patientId, currentUser);

    let record: MedicalRecordEntity | null;
    try {
      record = await this.medicalRecordRepository.findOne({
        where: { id, patientId },
        relations: ["patient", "patient.user", "creator", "office"],
      });
    } catch {
      throw internalError();
    }

    if (!record) {
      throw medicalRecordNotFound();
    }

    return record;
  }

  async create(
    patientId: string,
    dto: CreateMedicalRecordDto,
    currentUser: AuthUser
  ): Promise<MedicalRecordEntity> {
    await this.assertPatientAccess(patientId, currentUser);

    if (dto.officeId) {
      const office = await this.officeRepository.findOne({
        where: { id: dto.officeId },
      });
      if (!office) {
        throw notFound("Office");
      }
    }

    const entity = this.medicalRecordRepository.create({
      ...dto,
      patientId,
      createdBy: currentUser.id,
    });

    const saved = await this.medicalRecordRepository.save(entity);

    const withRelations = await this.medicalRecordRepository.findOne({
      where: { id: saved.id },
      relations: ["creator", "office"],
    });

    if (!withRelations) {
      throw internalError();
    }

    return withRelations;
  }

  private async assertPatientAccess(
    patientId: string,
    currentUser: AuthUser
  ): Promise<void> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw notFound("Patient");
    }

    const { isPatient, isStaff } = AuthHelper.getRoles(currentUser);
    if (isStaff) return;
    if (isPatient && patient.userId === currentUser.id) return;

    throw forbidden();
  }
}
