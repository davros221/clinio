import { z } from "zod";

export const createMedicalRecordSchema = z.object({
  examinationSummary: z.string().optional(),
  diagnosis: z.string().optional(),
});

export type CreateMedicalRecord = z.infer<typeof createMedicalRecordSchema>;
