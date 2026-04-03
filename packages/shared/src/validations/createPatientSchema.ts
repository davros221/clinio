import { z } from "zod";

export const createPatientSchema = z
  .object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    birthNumber: z.string().min(1, "Birth number is required."),
    birthdate: z.coerce.date({
      required_error: "Birthdate is required.",
      invalid_type_error: "Invalid date format.",
    }),
    phone: z.string().min(1, "Phone number is required."),
    email: z.string().email("Invalid email address."),
  })
  .required();

export const updatePatientSchema = createPatientSchema.partial();

export type CreatePatient = z.infer<typeof createPatientSchema>;
export type UpdatePatient = z.infer<typeof updatePatientSchema>;
