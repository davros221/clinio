// Typ schůzky ───────────────────────────────────────────────────────

export type Appointment = {
  id: string;
  patientName: string;
  room: string;
  start: string;
  duration: number;
  day: number;
};

// Sdílené konstanty ─────────────────────────────────────────────────────────

export const DAYS = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek"];

export const HOURS = Array.from({ length: 11 }, (_, i) => 7 + i); // 7–17h

export const SLOT_HEIGHT = 60; // px na hodinu

export const ROOM_COLORS: Record<string, { bg: string; text: string }> = {
  "Ordinace 1": { bg: "#168532", text: "#ffffff" },
  "Ordinace 2": { bg: "#ed9a47", text: "#ffffff" },
  "Ordinace 3": { bg: "#d00505", text: "#ffffff" },
  "Ordinace 4": { bg: "#521b89", text: "#ffffff" },
};

// Sdílené pomocné funkce ────────────────────────────────────────────────────

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function fmt(d: Date): string {
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}

export function getWeekStart(offset: number): Date {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}
