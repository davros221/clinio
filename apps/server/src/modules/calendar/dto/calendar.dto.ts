import { ApiProperty } from "@nestjs/swagger";

export enum CalendarHourState {
  AVAILABLE = "AVAILABLE",
  BOOKED = "BOOKED",
  NOT_AVAILABLE = "NOT_AVAILABLE",
}

// ToDo: Temporary mock enums/types — will be replaced with real data models
export enum AppointmentType {
  CHECKUP = "CHECKUP",
  CONSULTATION = "CONSULTATION",
  URGENT = "URGENT",
  FIRST_VISIT = "FIRST_VISIT",
}

export enum AppointmentStatus {
  CONFIRMED = "CONFIRMED",
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

// ToDo: Temporary mock type — will be replaced with real Doctor entity
export class CalendarAppointmentDoctor {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  specialization!: string;
}

// ToDo: Temporary mock type — will be replaced with real Patient entity
export class CalendarAppointmentPatient {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  phone!: string;

  @ApiProperty()
  insuranceCode!: string;
}

// ToDo: Temporary mock type — will be replaced with real Appointment entity
export class CalendarAppointment {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  isOwned!: boolean;

  // @ApiProperty({ enum: AppointmentType, enumName: "AppointmentType" })
  // type!: AppointmentType;

  // @ApiProperty({ enum: AppointmentStatus, enumName: "AppointmentStatus" })
  // status!: AppointmentStatus;

  @ApiProperty({ required: false })
  note?: string;

  @ApiProperty({ type: CalendarAppointmentPatient })
  patient?: CalendarAppointmentPatient;

  @ApiProperty({ type: CalendarAppointmentDoctor })
  doctor?: CalendarAppointmentDoctor;
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
