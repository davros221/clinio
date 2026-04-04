import { z } from "zod";

export const UserRole = {
  ADMIN: "ADMIN",
  NURSE: "NURSE",
  DOCTOR: "DOCTOR",
  CLIENT: "CLIENT",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]{8,}$/;

export const createUserSchema = z
  .object({
    email: z.email("Invalid email address."),
    password: z
      .string()
      .regex(
        passwordRegex,
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      )
      .optional(),
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    role: z.enum(UserRole),
    birthNumber: z.string().min(1, "Birth number is required.").optional(),
    birthdate: z
      .string()
      .min(1, "Birthdate is required.")
      .describe("ISO Date string (e.g. 1990-01-01)")
      .pipe(z.coerce.date())
      .optional(),
    phone: z.string().min(1, "Phone number is required.").optional(),
  })
  .refine(
    (data) => {
      if (data.role !== UserRole.CLIENT) return true;
      return !!data.birthNumber && !!data.birthdate && !!data.phone;
    },
    {
      message:
        "Fields birthNumber, birthdate, and phone are required for CLIENT role.",
    }
  );
