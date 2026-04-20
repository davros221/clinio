import { z } from "zod";

export const getCalendarQuerySchema = z.object({
  officeId: z.string().uuid("Valid office ID is required."),
  timestamp: z.coerce.number().int().positive(),
});

export type GetCalendarQuery = z.infer<typeof getCalendarQuerySchema>;
