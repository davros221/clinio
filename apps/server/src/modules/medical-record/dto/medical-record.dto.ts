import { ApiProperty } from "@nestjs/swagger";

export class MedicalRecordCreator {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;
}

export class MedicalRecordOffice {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class MedicalRecord {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  patientId!: string;

  @ApiProperty({ type: () => MedicalRecordCreator })
  creator!: MedicalRecordCreator;

  @ApiProperty({ nullable: true, type: () => MedicalRecordOffice })
  office!: MedicalRecordOffice | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ nullable: true, type: String })
  examinationSummary!: string | null;

  @ApiProperty({ nullable: true, type: String })
  diagnosis!: string | null;
}
