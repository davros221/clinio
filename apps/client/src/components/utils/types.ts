import { DAYS } from "@clinio/shared";

export type Appointment = {
  id: string;
  patientName: string;
  room: string;
  start: string;
  roomNumber: number;
  duration: number;
  day: number;
};

export const CAP_DAYS = DAYS.map(
  (day) => day.charAt(0).toUpperCase() + day.slice(1)
);
export const CAP_WORK_DAYS = CAP_DAYS.filter(
  (day) => !["Saturday", "Sunday"].includes(day)
);

export const HOURS = Array.from({ length: 11 }, (_, i) => 7 + i);
export const SLOT_HEIGHT = 60;
