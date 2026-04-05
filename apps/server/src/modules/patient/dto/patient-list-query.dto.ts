import { patientListSchema } from "@clinio/shared";
import { createZodDto } from "nestjs-zod";

export class PatientListQueryDto extends createZodDto(patientListSchema) {}
