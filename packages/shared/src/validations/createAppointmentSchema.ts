import { z } from "zod";

export enum AppointmentStatus {
  PLANNED = "PLANNED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const createAppointmentSchema = z.object({
  officeId: z.string().uuid(),
  patientId: z.string().nullable().optional(),
  datetime: z.string().datetime(),
  status: z.nativeEnum(AppointmentStatus),
  note: z.string(),
});
