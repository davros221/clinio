export type Appointment = {
  id: string;
  patientName: string;
  room: string;
  start: string;
  roomNumber: number;
  duration: number;
  day: number;
};

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const WEEK_DAYS = [...DAYS, "Saturday", "Sunday"];
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
