import { ApiProperty } from "@nestjs/swagger";
import { AppointmentStatus } from "@clinio/shared";

export class AppointmentOffice {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class Appointment {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  officeId!: string;

  @ApiProperty({ type: () => AppointmentOffice, nullable: true })
  office!: AppointmentOffice | null;

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
