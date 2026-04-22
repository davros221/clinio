import { ApiProperty } from "@nestjs/swagger";

export class MedicalRecord {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  patientId!: string;

  @ApiProperty()
  createdBy!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ nullable: true, type: String })
  examinationSummary!: string | null;

  @ApiProperty({ nullable: true, type: String })
  diagnosis!: string | null;
}
