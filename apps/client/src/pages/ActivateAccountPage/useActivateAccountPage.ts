import { passwordRegex } from "@clinio/shared";
import { useNavigate, useSearchParams } from "react-router";
import { useResetPasswordMutation } from "@api";
import { schemaResolver, useForm } from "@mantine/form";
import { ROUTER_PATHS } from "@router";
import { z } from "zod";

const schema = z
  .object({
    password: z.string().regex(passwordRegex, "password.notValid"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "passwords.notMatch",
    path: ["passwordConfirm"],
  });

export const useActivateAccountPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const { mutate: resetPassword } = useResetPasswordMutation();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      password: "",
      passwordConfirm: "",
    },
    validate: schemaResolver(schema),
  });

  const handleSubmit = form.onSubmit((data) => {
    const { password } = data;
    if (!token) return;
    resetPassword(
      { token, password },
      {
        onSuccess: (data) => {
          navigate(ROUTER_PATHS.LOGIN, {
            state: { prefillEmail: data?.email },
          });
        },
      }
    );
  });

  return {
    form,
    handleSubmit,
  };
};
