import { z } from "zod";
import { createUserSchema } from "@clinio/shared";

export type CreateUserDto = z.infer<typeof createUserSchema>;
