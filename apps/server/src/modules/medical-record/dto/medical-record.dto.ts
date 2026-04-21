import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class MedicalRecord {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  patientId!: string;

  @ApiProperty()
  createdBy!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  examinationSummary!: string | null;

  @ApiPropertyOptional({ nullable: true })
  diagnosis!: string | null;
}
