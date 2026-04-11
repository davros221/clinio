import { z } from "zod";

export const sendActivationEmailSchema = z
  .object({
    email: z.email("Invalid email address."),
  })
  .required();
