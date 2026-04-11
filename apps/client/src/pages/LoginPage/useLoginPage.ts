import { schemaResolver, useForm } from "@mantine/form";
import { loginSchema } from "@clinio/shared";
import { LoginDto } from "@clinio/api";
import { useNavigate } from "react-router";
import { ROUTER_PATHS } from "../../router/routes.ts";
import { useLoginMutation } from "@api";

const initialValues: LoginDto = {
  email: "",
  password: "",
};

export const useLoginPage = () => {
  const navigate = useNavigate();

  const { mutate: login, isPending: isLoading } = useLoginMutation();

  const form = useForm({
    mode: "uncontrolled",
    initialValues,
    validate: schemaResolver(loginSchema, { sync: true }),
  });

  const handleSubmit = form.onSubmit((data) => {
    login(data, {
      onSuccess: () => {
        navigate(ROUTER_PATHS.HOME);
      },
    });
  });

  const handleSignUp = () => {
    navigate(ROUTER_PATHS.SIGN_UP);
  };

  return {
    form,
    handleSignUp,
    handleSubmit,
    isLoading,
  };
};
