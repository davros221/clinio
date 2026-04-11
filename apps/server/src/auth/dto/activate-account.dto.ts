import { createZodDto } from "nestjs-zod";
import { activateAccountSchema } from "@clinio/shared";

export class ActivateAccountDto extends createZodDto(activateAccountSchema) {}
