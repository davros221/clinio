import { getDay, parseISO } from "date-fns";
import { DAYS, OfficeHoursTemplate } from "@clinio/shared";

type TimeSlot = OfficeHoursTemplate[keyof OfficeHoursTemplate][number];

const MIN_GRID_HOURS = 8;

export class OfficeHoursHelper {
  static getWeekdayKey(dateStr: string): (typeof DAYS)[number] {
    // getDay: 0=Sunday..6=Saturday; template is Monday-first
    const dayIndex = (getDay(parseISO(dateStr)) + 6) % 7;
    return DAYS[dayIndex];
  }

  static getSlotsForDate(
    template: OfficeHoursTemplate | null,
    dateStr: string
  ): TimeSlot[] {
    if (!template) return [];
    const key = OfficeHoursHelper.getWeekdayKey(dateStr);
    return template[key] ?? [];
  }

  static isHourOpen(slots: TimeSlot[], hour: number): boolean {
    return slots.some((slot) => hour >= slot.from && hour < slot.to);
  }

  /**
   * Compute the hour grid bounds [start, end) used for the weekly calendar.
   * Takes the min `from` and max `to` across all days of the template,
   * then expands to at least MIN_GRID_HOURS hours. Returns null range
   * (start === end) when the template has no slots.
   */
  static computeGridRange(template: OfficeHoursTemplate | null): {
    start: number;
    end: number;
  } {
    if (!template) return { start: 0, end: 0 };

    let min = Infinity;
    let max = -Infinity;
    for (const day of DAYS) {
      for (const slot of template[day] ?? []) {
        if (slot.from < min) min = slot.from;
        if (slot.to > max) max = slot.to;
      }
    }

    if (min === Infinity) return { start: 0, end: 0 };

    let start = min;
    let end = max;
    const span = end - start;
    if (span < MIN_GRID_HOURS) {
      const missing = MIN_GRID_HOURS - span;
      end = Math.min(24, end + missing);
      const stillMissing = MIN_GRID_HOURS - (end - start);
      if (stillMissing > 0) {
        start = Math.max(0, start - stillMissing);
      }
    }

    return { start, end };
  }
}
