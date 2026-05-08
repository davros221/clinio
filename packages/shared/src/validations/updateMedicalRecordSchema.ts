import { z } from "zod";

export const updateMedicalRecordSchema = z
  .object({
    officeId: z.string().uuid().nullable(),
    examinationSummary: z.string().nullable(),
    diagnosis: z.string().nullable(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateMedicalRecord = z.infer<typeof updateMedicalRecordSchema>;
