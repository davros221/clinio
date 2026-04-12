import { TextInput, PasswordInput, Title, Stack } from "@mantine/core";
import { useT } from "@hooks";
import { useLoginPage } from "./useLoginPage.ts";
import { AuthFooter, SubmitButton } from "@components";

const FORM_ID = "loginForm";

export const LoginPage = () => {
  const t = useT();
  const { handleSubmit, form, isLoading } = useLoginPage();
  return (
    <Stack miw={300} gap={"lg"}>
      <Title ta="center" c="blue" order={1}>
        {t("login.welcome")}
      </Title>

      <form onSubmit={handleSubmit} id={FORM_ID}>
        <Stack>
          <TextInput
            placeholder={t("login.emailPlaceholder")}
            label={t("login.emailLabel")}
            radius="md"
            size="md"
            {...form.getInputProps("email")}
          />

          <PasswordInput
            placeholder={t("login.passwordPlaceholder")}
            label={t("login.passwordLabel")}
            radius="md"
            size="md"
            {...form.getInputProps("password")}
          />
        </Stack>
      </form>

      <div>
        <SubmitButton type={"submit"} loading={isLoading} form={FORM_ID}>
          {t("login.submitButton")}
        </SubmitButton>
        <AuthFooter links={["forgotPassword", "signUp"]} />
      </div>
    </Stack>
  );
};
