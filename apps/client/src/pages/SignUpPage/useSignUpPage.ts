import { CreateUserDto } from "@clinio/api";
import { buildCreateUserSchema, UserRole } from "@clinio/shared";
import { schemaResolver } from "@mantine/form";
import { useUserForm } from "../../form/createUserForm/CreateUserFormContext.ts";
import { useCreateUserMutation } from "../../api/userService.ts";
import { useNavigate } from "react-router";
import { ROUTER_PATHS } from "../../router/routes.ts";

const initialValues: CreateUserDto = {
  role: UserRole.CLIENT,
  firstName: "",
  lastName: "",
  email: "",
  birthdate: "",
  phone: "",
  birthNumber: "",
};

export const useSignUpPage = () => {
  const signUpSchema = buildCreateUserSchema({ passwordFields: true });
  const navigate = useNavigate();

  const form = useUserForm({
    validate: schemaResolver(signUpSchema, { sync: true }),
    initialValues,
  });

  const { mutate: createUser, isPending } = useCreateUserMutation();

  const handleSubmit = form.onSubmit((data) => {
    createUser(data, {
      onSuccess: () => {
        form.reset();
      },
    });
  });

  const handleLogin = () => {
    navigate(ROUTER_PATHS.LOGIN);
  };

  return {
    handleSubmit,
    form,
    isPending,
    handleLogin,
  };
};
