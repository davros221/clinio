import { createPatientSchema } from "@clinio/shared";
import { createZodDto } from "nestjs-zod";

export class CreatePatientDto extends createZodDto(createPatientSchema) {}
