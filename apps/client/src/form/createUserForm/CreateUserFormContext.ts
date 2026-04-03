import { createFormContext } from "@mantine/form";
import { CreateUserDto } from "@clinio/api";

export const [UserFormProvider, useUserFormContext, useUserForm] =
  createFormContext<CreateUserDto>();
