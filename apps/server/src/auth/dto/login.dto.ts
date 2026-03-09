import { z } from "zod";
import { loginSchema } from "@clinio/shared";

export type LoginDto = z.infer<typeof loginSchema>;
