import { CreateUserDto } from "@clinio/api";
import { buildCreateUserSchema, UserRole } from "@clinio/shared";
import { schemaResolver } from "@mantine/form";
import { useUserForm } from "../../form/createUserForm/CreateUserFormContext.ts";
import { useCreateUserMutation } from "@api";
import { useNavigate } from "react-router";
import { ROUTER_PATHS } from "@router";

export const useSignUpPage = (initialized: boolean) => {
  const signUpSchema = buildCreateUserSchema({ passwordFields: true });
  const navigate = useNavigate();

  const initialValues: CreateUserDto = {
    role: initialized ? UserRole.CLIENT : UserRole.ADMIN,
    firstName: "",
    lastName: "",
    email: "",
    birthdate: "",
    phone: "",
    birthNumber: "",
  };

  const form = useUserForm({
    validate: schemaResolver(signUpSchema, { sync: true }),
    initialValues,
  });

  const { mutate: createUser, isPending } = useCreateUserMutation();

  const handleSubmit = form.onSubmit((data) => {
    createUser(data, {
      onSuccess: () => {
        form.reset();
        navigate(ROUTER_PATHS.LOGIN, {
          state: { prefillEmail: data.email },
        });
      },
    });
  });

  return {
    handleSubmit,
    form,
    isPending,
  };
};
