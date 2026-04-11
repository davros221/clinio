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

export const ROOM_COLORS: Record<string, { bg: string; text: string }> = {
  "Ordinace 1": {
    bg: "var(--mantine-color-teal-8)",
    text: "var(--mantine-color-white)",
  },
  "Ordinace 2": {
    bg: "var(--mantine-color-yellow-6)",
    text: "var(--mantine-color-white)",
  },
  "Ordinace 3": {
    bg: "var(--mantine-color-red-8)",
    text: "var(--mantine-color-white)",
  },
  "Ordinace 4": {
    bg: "var(--mantine-color-grape-8)",
    text: "var(--mantine-color-white)",
  },
};
