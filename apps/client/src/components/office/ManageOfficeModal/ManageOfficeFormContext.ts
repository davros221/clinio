import { createFormContext } from "@mantine/form";

export type IntervalType = { from: number | null; to: number | null };

export type DayEntryType = {
  key: string;
  checked: boolean;
  intervals: IntervalType[];
};

export type ManageOfficeFormValues = {
  name: string;
  specialization: string;
  address: string;
  days: DayEntryType[];
  staffIds: string[];
};

/** Max 2 intervals per day (e.g. morning + afternoon split) */
export const MAX_INTERVALS_PER_DAY = 2;

export const DEFAULT_INTERVAL = { from: 8, to: 16 };

/** Format hour number to display string, e.g. 8 → "08:00" */
export function formatHour(h: number): string {
  return `${h.toString().padStart(2, "0")}:00`;
}

export const [
  ManageOfficeFormProvider,
  useManageOfficeFormContext,
  useManageOfficeForm,
] = createFormContext<ManageOfficeFormValues>();
