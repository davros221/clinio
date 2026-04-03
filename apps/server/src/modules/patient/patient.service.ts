import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ErrorCode } from "@clinio/shared";
import { PatientEntity } from "./patient.entity";
import { CreatePatientDto } from "./dto/create-patient.dto";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import { internalError, notFound } from "../../common/error-messages";

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(PatientEntity)
    private patientRepository: Repository<PatientEntity>
  ) {}

  async findById(id: string): Promise<PatientEntity> {
    let patient: PatientEntity | null;
    try {
      patient = await this.patientRepository.findOne({ where: { id } });
    } catch {
      throw internalError();
    }

    if (!patient) {
      throw notFound("Patient", ErrorCode.PATIENT_NOT_FOUND);
    }
    return patient;
  }

  async create(dto: CreatePatientDto): Promise<PatientEntity> {
    const entity = this.patientRepository.create(dto);
    return this.patientRepository.save(entity);
  }

  async update(id: string, dto: UpdatePatientDto): Promise<PatientEntity> {
    const patient = await this.findById(id);
    Object.assign(patient, dto);
    return this.patientRepository.save(patient);
  }

  async delete(id: string): Promise<void> {
    const result = await this.patientRepository.delete(id);
    if (result.affected === 0) {
      throw notFound("Patient", ErrorCode.PATIENT_NOT_FOUND);
    }
  }
}
