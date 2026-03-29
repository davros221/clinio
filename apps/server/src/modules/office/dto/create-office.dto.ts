import { createOfficeSchema } from "@clinio/shared";
import { createZodDto } from "nestjs-zod";

export class CreateOfficeDto extends createZodDto(createOfficeSchema) {}
