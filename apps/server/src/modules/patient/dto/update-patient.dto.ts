import { updatePatientSchema } from "@clinio/shared";
import { createZodDto } from "nestjs-zod";

export class UpdatePatientDto extends createZodDto(updatePatientSchema) {}
