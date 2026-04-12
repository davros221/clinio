import { createZodDto } from "nestjs-zod";
import { requestPasswordResetSchema } from "@clinio/shared";

export class RequestPasswordResetDto extends createZodDto(
  requestPasswordResetSchema
) {}
