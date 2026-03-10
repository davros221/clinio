import { z } from "zod";

export enum EUserRole {
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  CLIENT = "CLIENT",
}

const userRoleEnum = z.enum([...Object.values(EUserRole)]);

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const createUserSchema = z
  .object({
    email: z.email("Invalid email address."),
    password: z
      .string()
      .regex(
        passwordRegex,
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      ),
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    role: userRoleEnum,
  })
  .required();
