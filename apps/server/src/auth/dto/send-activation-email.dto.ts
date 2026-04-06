import { createZodDto } from "nestjs-zod";
import { sendActivationEmailSchema } from "@clinio/shared";

export class SendActivationEmailDto extends createZodDto(
  sendActivationEmailSchema
) {}
