import { useState } from "react";
import { useNavigate } from "react-router";
import { useRequestPassReset } from "@api";
import { schemaResolver, useForm } from "@mantine/form";
import { z } from "zod";
import { useT } from "@hooks";

const schema = z.object({
  email: z.email(),
});

export const useResetPasswordPage = () => {
  const t = useT();
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();
  const { mutate: requestReset, isPending } = useRequestPassReset();

  const submitButtonLabel = completed
    ? t("common.auth.emailSentButton")
    : t("common.auth.sendEmailButton");

  const form = useForm({
    mode: "uncontrolled",
    validate: schemaResolver(schema, { sync: true }),
  });

  const handleSubmit = form.onSubmit((data) => {
    requestReset(data.email, {
      onSuccess: () => {
        setCompleted(true);
      },
    });
  });

  return {
    handleSubmit,
    navigate,
    form,
    isPending,
    completed,
    submitButtonLabel,
  };
};
