import { z } from "zod";

export const AppointmentStatus = {
  PLANNED: "PLANNED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type AppointmentStatus =
  (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const createAppointmentSchema = z.object({
  officeId: z.string().uuid().nullable().optional(),
  patientId: z.string().nullable().optional(),
  datetime: z.string().datetime(),
  status: z.enum(AppointmentStatus),
  note: z.string(),
});
