import type { CreateUserDto, User } from "@clinio/api";

export type Patient = User;

export type CreatePatientDto = Omit<CreateUserDto, "password" | "role">;
