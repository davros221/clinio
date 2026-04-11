import { z } from "zod";
import { passwordRegex } from "./createUserSchema.js";

export const activateAccountSchema = z
  .object({
    token: z.string().min(1, "Activation token is required."),
    password: z
      .string()
      .regex(
        passwordRegex,
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      ),
  })
  .required();
