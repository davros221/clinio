import { updateMedicalRecordSchema } from "@clinio/shared";
import { createZodDto } from "nestjs-zod";

export class UpdateMedicalRecordDto extends createZodDto(
  updateMedicalRecordSchema
) {}
