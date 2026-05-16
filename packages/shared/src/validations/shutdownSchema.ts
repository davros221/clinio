import { z } from "zod";

export const shutdownSchema = z.object({
  password: z.string().min(1, "Password is required."),
});
