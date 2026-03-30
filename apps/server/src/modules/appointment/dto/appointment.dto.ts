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
  datetime!: Date;

  @ApiProperty({ enum: AppointmentStatus })
  status!: AppointmentStatus;

  @ApiProperty()
  note!: string;
}
