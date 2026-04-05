import { z } from "zod";

export const getCalendarQuerySchema = z.object({
  officeId: z.string().uuid("Valid office ID is required."),
  timestamp: z
    .string()
    .regex(/^\d+$/, "Timestamp must be a numeric value.")
    .transform(Number),
});

export type GetCalendarQuery = z.infer<typeof getCalendarQuerySchema>;
