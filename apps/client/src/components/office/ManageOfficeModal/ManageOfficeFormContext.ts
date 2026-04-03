import { createFormContext } from "@mantine/form";
import type { IntervalType } from "./ManageOfficeModalDayRow";

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

export const [
  ManageOfficeFormProvider,
  useManageOfficeFormContext,
  useManageOfficeForm,
] = createFormContext<ManageOfficeFormValues>();
