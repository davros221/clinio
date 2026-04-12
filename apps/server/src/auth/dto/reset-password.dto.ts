import { createZodDto } from "nestjs-zod";
import { resetPasswordSchema } from "@clinio/shared";

export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {}
