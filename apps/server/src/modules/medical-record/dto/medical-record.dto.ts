import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class MedicalRecordCreator {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;
}

export class MedicalRecord {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  patientId!: string;

  @ApiProperty({ type: () => MedicalRecordCreator })
  creator!: MedicalRecordCreator;

  @ApiProperty()
  createdAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  examinationSummary!: string | null;

  @ApiPropertyOptional({ nullable: true })
  diagnosis!: string | null;
}
