import { ApiProperty } from "@nestjs/swagger";

export enum CalendarHourState {
  AVAILABLE = "AVAILABLE",
  BOOKED = "BOOKED",
  NOT_AVAILABLE = "NOT_AVAILABLE",
}

export class CalendarAppointmentPatient {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ required: false, nullable: true })
  phone?: string | null;

  @ApiProperty({ required: false, nullable: true })
  birthNumber?: string | null;
}

export class CalendarAppointment {
  @ApiProperty()
  id!: string;

  @ApiProperty({ required: false })
  note?: string;

  @ApiProperty({ type: CalendarAppointmentPatient, required: false })
  patient?: CalendarAppointmentPatient;
}

export class CalendarHour {
  @ApiProperty()
  hour!: number;

  @ApiProperty({ enum: CalendarHourState, enumName: "CalendarHourState" })
  state!: CalendarHourState;

  @ApiProperty({ type: CalendarAppointment, required: false })
  appointment?: CalendarAppointment;
}

export class CalendarDay {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  day!: number;

  @ApiProperty({ type: [CalendarHour] })
  hours!: CalendarHour[];
}
