import { shutdownSchema } from "@clinio/shared";
import { createZodDto } from "nestjs-zod";

export class ShutdownDto extends createZodDto(shutdownSchema) {}
