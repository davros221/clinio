import { schemaResolver, useForm } from "@mantine/form";
import { loginSchema } from "@clinio/shared";
import { LoginDto } from "@clinio/api";
import { useNavigate, useSearchParams } from "react-router";
import { ROUTER_PATHS } from "@router";
import { useLoginMutation } from "@api";

const initialValues: LoginDto = {
  email: "",
  password: "",
};

export const useLoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefill = searchParams.get("prefill");

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
