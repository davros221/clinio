import { ApiProperty } from "@nestjs/swagger";
import { AppointmentStatus } from "@clinio/shared";

export class Appointment {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  officeId!: string;

  @ApiProperty({ nullable: true, type: String })
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
