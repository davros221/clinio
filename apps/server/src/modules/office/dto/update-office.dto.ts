import { updateOfficeSchema } from "@clinio/shared";
import { createZodDto } from "nestjs-zod";

export class UpdateOfficeDto extends createZodDto(updateOfficeSchema) {}
