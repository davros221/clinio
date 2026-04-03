import { createPatientSchema } from "@clinio/shared";
import { createZodDto } from "nestjs-zod";

console.log("DEBUG: createPatientSchema is:", createPatientSchema); // If this logs 'undefined', Fix #1 is required

export class CreatePatientDto extends createZodDto(createPatientSchema) {}
