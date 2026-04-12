import { Stack, TextInput, Title } from "@mantine/core";
import { useT } from "@hooks";
import { useResetPasswordPage } from "./useResetPasswordPage.ts";
import { AuthFooter, SubmitButton } from "@components";

const FORM_ID = "resetPasswordForm";

export const ResetPasswordPage = () => {
  const t = useT();
  const { form, isPending, submitButtonLabel, handleSubmit, completed } =
    useResetPasswordPage();
  return (
    <Stack gap={"md"} miw={300}>
      <Title ta="center" c="blue" order={1}>
        {t("common.auth.resetPassword")}
      </Title>
      <form id={FORM_ID} onSubmit={handleSubmit}>
        <TextInput
          label={t("common.auth.email")}
          {...form.getInputProps("email")}
        />
      </form>
      <SubmitButton
        loading={isPending}
        type={"submit"}
        form={FORM_ID}
        disabled={completed || isPending}
      >
        {submitButtonLabel}
      </SubmitButton>

      <AuthFooter links={["login", "signUp"]} />
    </Stack>
  );
};
