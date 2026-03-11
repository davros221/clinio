import { createUserSchema } from "@clinio/shared";
import { createZodDto } from "nestjs-zod";

export class CreateUserDto extends createZodDto(createUserSchema) {}
