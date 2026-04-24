import { z } from "zod";
import { AppointmentStatus } from "./createAppointmentSchema.js";

export const updateAppointmentSchema = z
  .object({
    status: z.enum(AppointmentStatus),
    note: z.string(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
