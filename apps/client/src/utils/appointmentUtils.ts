import { AppointmentStatus } from "@clinio/shared";

export const APPOINTMENT_STATUS_COLOR: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PLANNED]: "blue",
  [AppointmentStatus.COMPLETED]: "teal",
  [AppointmentStatus.CANCELLED]: "gray",
};

export const APPOINTMENT_STATUS_STYLE: Record<
  AppointmentStatus,
  { bg: string; color: string; border: string }
> = {
  [AppointmentStatus.PLANNED]: {
    bg: "var(--mantine-color-blue-0)",
    color: "var(--mantine-color-blue-8)",
    border: "var(--mantine-color-blue-4)",
  },
  [AppointmentStatus.COMPLETED]: {
    bg: "var(--mantine-color-teal-0)",
    color: "var(--mantine-color-teal-8)",
    border: "var(--mantine-color-teal-4)",
  },
  [AppointmentStatus.CANCELLED]: {
    bg: "var(--mantine-color-gray-1)",
    color: "var(--mantine-color-gray-6)",
    border: "var(--mantine-color-gray-4)",
  },
};

/** @deprecated use APPOINTMENT_STATUS_STYLE */
export const APPOINTMENT_STATUS_BG: Record<AppointmentStatus, string> =
  Object.fromEntries(
    Object.entries(APPOINTMENT_STATUS_STYLE).map(([k, v]) => [k, v.bg])
  ) as Record<AppointmentStatus, string>;
