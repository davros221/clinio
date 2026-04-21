import { createMedicalRecordSchema } from "@clinio/shared";
import { createZodDto } from "nestjs-zod";

export class CreateMedicalRecordDto extends createZodDto(
  createMedicalRecordSchema
) {}
