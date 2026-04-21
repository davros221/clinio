import { medicalRecordListSchema } from "@clinio/shared";
import { createZodDto } from "nestjs-zod";

export class MedicalRecordListQueryDto extends createZodDto(
  medicalRecordListSchema
) {}
