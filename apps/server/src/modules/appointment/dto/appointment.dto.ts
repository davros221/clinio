import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AppointmentStatus } from "@clinio/shared";

export class Appointment {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  officeId!: string;

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
