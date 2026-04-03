import { CreateUserModalProps } from "./CreateUserModal.tsx";
import { useUserForm } from "../../../form/createUserForm/CreateUserFormContext.ts";
import { buildCreateUserSchema, UserRole } from "@clinio/shared";
import { CreateUserDto } from "@clinio/api";
import { schemaResolver } from "@mantine/form";
import { useCreateUserMutation } from "../../../api/userService.ts";

export const useCreateUserModal = (props: CreateUserModalProps) => {
  const initialValues: CreateUserDto = {
    firstName: "",
    lastName: "",
    email: "",
    role: props.mode === "staff" ? UserRole.DOCTOR : UserRole.CLIENT,
  };

  // ToDo: REMOVE password from staff creating form
  const createUserSchema = buildCreateUserSchema({
    passwordFields: props.mode === "staff",
  });

  const form = useUserForm({
    initialValues,
    validate: schemaResolver(createUserSchema, { sync: true }),
  });

  const { mutate: createUser, isPending } = useCreateUserMutation();

  const handleClose = () => {
    form.reset();
    props.onClose();
  };

  const handleSubmit = form.onSubmit((data) => {
    createUser(data, {
      onSuccess: (data) => {
        form.reset();
        props.onClose();
      },
    });
  });

  return {
    form,
    handleClose,
    handleSubmit,
    isPending,
  };
};
