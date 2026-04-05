import { z } from "zod";

export const createPatientSchema = z
  .object({
    userId: z.string().uuid("Valid user ID is required."),
    birthNumber: z.string().min(1, "Birth number is required."),
    // FIX: Define as string for Swagger, then transform/coerce to Date
    birthdate: z
      .string()
      .min(1, "Birthdate is required.")
      .describe("ISO Date string (e.g. 1990-01-01)")
      .pipe(z.coerce.date()),
    phone: z.string().min(1, "Phone number is required."),
  })
  .required();

export const updatePatientSchema = createPatientSchema
  .omit({ userId: true })
  .partial();

export type CreatePatient = z.infer<typeof createPatientSchema>;
export type UpdatePatient = z.infer<typeof updatePatientSchema>;
