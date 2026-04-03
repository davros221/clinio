import { CreateUserDto } from "@clinio/api";
import { buildCreateUserSchema, UserRole } from "@clinio/shared";
import { schemaResolver } from "@mantine/form";
import { useUserForm } from "../../form/createUserForm/CreateUserFormContext.ts";
import { useCreateUserMutation } from "../../api/userService.ts";

const initialValues: CreateUserDto = {
  role: UserRole.CLIENT,
  firstName: "",
  lastName: "",
  email: "",
  birthdate: "",
  phone: "",
  birthNumber: "",
};

interface Props {
  onSuccess?: (email: string) => void;
}

export const useSignUpPanel = (props: Props) => {
  const signUpSchema = buildCreateUserSchema({ passwordFields: true });
  const form = useUserForm({
    validate: schemaResolver(signUpSchema, { sync: true }),
    initialValues,
  });

  const { mutate: createUser, isPending } = useCreateUserMutation();

  const handleSubmit = form.onSubmit((data) => {
    createUser(data, {
      onSuccess: () => {
        props.onSuccess?.(data.email);
        form.reset();
      },
    });
  });

  return {
    handleSubmit,
    form,
    isPending,
  };
};
