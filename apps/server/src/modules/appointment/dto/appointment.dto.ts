import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AppointmentStatus } from "@clinio/shared";

export class Appointment {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ nullable: true })
  officeId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  patientId!: string | null;

  @ApiProperty()
  date!: string;

  @ApiProperty()
  hour!: number;

  @ApiProperty({ enum: AppointmentStatus })
  status!: AppointmentStatus;

  @ApiProperty()
  note!: string;
}
