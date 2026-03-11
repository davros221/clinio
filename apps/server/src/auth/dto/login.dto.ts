import { createZodDto } from "nestjs-zod";
import { loginSchema } from "@clinio/shared";

export class LoginDto extends createZodDto(loginSchema) {}
