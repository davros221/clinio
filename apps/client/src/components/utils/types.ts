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
export const HOURS = Array.from({ length: 11 }, (_, i) => 7 + i);
export const SLOT_HEIGHT = 60;

const ROOM_COLORS: { bg: string; text: string }[] = [
  { bg: "var(--mantine-color-teal-8)", text: "var(--mantine-color-white)" },
  { bg: "var(--mantine-color-yellow-6)", text: "var(--mantine-color-white)" },
  { bg: "var(--mantine-color-red-8)", text: "var(--mantine-color-white)" },
  { bg: "var(--mantine-color-grape-8)", text: "var(--mantine-color-white)" },
];

export function getRoomColor(roomNumber: number) {
  return ROOM_COLORS[roomNumber % ROOM_COLORS.length];
}
