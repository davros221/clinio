import { schemaResolver, useForm } from "@mantine/form";
import { loginSchema } from "@clinio/shared";
import { LoginDto } from "@clinio/api";
import { useLocation, useNavigate } from "react-router";
import { ROUTER_PATHS } from "@router";
import { useLoginMutation } from "@api";

const initialValues: LoginDto = {
  email: "",
  password: "",
};

export const useLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const prefill = location.state?.prefillEmail;

  const { mutate: login, isPending: isLoading } = useLoginMutation();

  const getInitValues = () => {
    return prefill ? { email: prefill || "", password: "" } : initialValues;
  };

  const form = useForm({
    mode: "uncontrolled",
    initialValues: getInitValues(),
    validate: schemaResolver(loginSchema, { sync: true }),
  });

  const handleSubmit = form.onSubmit((data) => {
    login(data, {
      onSuccess: () => {
        navigate(ROUTER_PATHS.HOME);
      },
    });
  });

  return {
    form,
    handleSubmit,
    isLoading,
  };
};
