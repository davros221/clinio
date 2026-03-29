import {
  startOfWeek,
  addWeeks,
  addDays,
  format,
  setHours,
  setMinutes,
  getHours,
  getMinutes,
} from "date-fns";

// Returns the Monday of the week offset by the given number of weeks
export function getWeekStart(offset: number): Date {
  return startOfWeek(addWeeks(new Date(), offset), { weekStartsOn: 1 });
}

// Returns the date of a specific day in the week by index (0 = Monday)
export function getWeekDay(weekStart: Date, dayIndex: number): Date {
  return addDays(weekStart, dayIndex);
}

// Formats a date to short format "d.M."
export function fmt(d: Date): string {
  return format(d, "d.M.");
}

// Converts "HH:MM" to minutes since midnight
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  const date = setMinutes(setHours(new Date(), h), m);
  return getHours(date) * 60 + getMinutes(date);
}

// Converts minutes since midnight to "HH:MM"
export function minutesToTime(minutes: number): string {
  const date = setMinutes(
    setHours(new Date(), Math.floor(minutes / 60)),
    minutes % 60
  );
  return format(date, "HH:mm");
}
