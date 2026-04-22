import { ApiProperty } from "@nestjs/swagger";

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

  @ApiProperty({ nullable: true, type: String })
  examinationSummary!: string | null;

  @ApiProperty({ nullable: true, type: String })
  diagnosis!: string | null;
}
