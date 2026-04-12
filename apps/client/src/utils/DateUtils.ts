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

export class DateUtils {
  /**
   * Returns the Monday of the week offset by the given number of weeks
   * @param offset
   */
  public static getWeekStart(offset: number): Date {
    return startOfWeek(addWeeks(new Date(), offset), { weekStartsOn: 1 });
  }

  /**
   * Returns the date of a specific day in the week by index (0 = Monday)
   * @param weekStart
   * @param dayIndex
   */
  public static getWeekDay(weekStart: Date, dayIndex: number): Date {
    return addDays(weekStart, dayIndex);
  }

  /**
   * Formats a date to "d.M.yyyy"
   * @param dateStr
   */
  public static formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split("-").map(Number);
    return format(new Date(year, month - 1, day), "d.M.yyyy");
  }

  public static fmt(d: Date): string {
    return format(d, "d.M.");
  }

  /**
   * Converts "HH:MM" to minutes since midnight
   * @param time
   */
  public static timeToMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    const date = setMinutes(setHours(new Date(), h), m);
    return getHours(date) * 60 + getMinutes(date);
  }

  /**
   * Converts minutes since midnight to "HH:MM"
   * @param minutes
   */
  public static minutesToTime(minutes: number): string {
    const date = setMinutes(
      setHours(new Date(), Math.floor(minutes / 60)),
      minutes % 60
    );
    return format(date, "HH:mm");
  }
}
