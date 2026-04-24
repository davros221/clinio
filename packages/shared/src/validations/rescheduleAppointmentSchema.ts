import { z } from "zod";

export const rescheduleAppointmentSchema = z.object({
  date: z.string().date(),
  hour: z.number().int().min(0).max(23),
});

export type RescheduleAppointmentInput = z.infer<
  typeof rescheduleAppointmentSchema
>;
