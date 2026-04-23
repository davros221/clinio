import { z } from "zod";

export const createMedicalRecordSchema = z.object({
  officeId: z.string().uuid().optional(),
  examinationSummary: z.string().optional(),
  diagnosis: z.string().optional(),
});

export type CreateMedicalRecord = z.infer<typeof createMedicalRecordSchema>;
