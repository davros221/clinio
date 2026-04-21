import { MedicalRecord } from "../dto/medical-record.dto";
import { MedicalRecordEntity } from "../medical-record.entity";

export class MedicalRecordMapper {
  static toDto(entity: MedicalRecordEntity): MedicalRecord {
    return {
      id: entity.id,
      patientId: entity.patientId,
      createdBy: entity.creator
        ? `${entity.creator.firstName} ${entity.creator.lastName}`
        : entity.createdBy,
      createdAt: entity.createdAt,
      examinationSummary: entity.examinationSummary,
      diagnosis: entity.diagnosis,
    };
  }

  static toDtoList(entities: MedicalRecordEntity[]): MedicalRecord[] {
    return entities.map(this.toDto);
  }
}
