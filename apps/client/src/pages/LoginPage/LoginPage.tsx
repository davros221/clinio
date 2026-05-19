import {
  TextInput,
  PasswordInput,
  Title,
  Stack,
  Divider,
  Center,
  Loader,
} from "@mantine/core";
import { Navigate } from "react-router";
import { useT } from "@hooks";
import { useLoginPage } from "./useLoginPage.ts";
import { AuthFooter, GoogleAuthButton, SubmitButton } from "@components";
import { useGetAppStatusQuery } from "@api";
import { ROUTER_PATHS } from "@router";

const FORM_ID = "loginForm";

export const LoginPage = () => {
  const t = useT();
  const { data: status, isLoading: isStatusLoading } = useGetAppStatusQuery();
  const { handleSubmit, form, isLoading } = useLoginPage();

  if (isStatusLoading) {
    return (
      <Center mih={200}>
        <Loader />
      </Center>
    );
  }

  if (status && !status.initialized) {
    return <Navigate to={ROUTER_PATHS.SIGN_UP} replace />;
  }
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

        <Divider my="sm" label={t("login.orDivider")} labelPosition="center" />

        <GoogleAuthButton />

        <AuthFooter links={["forgotPassword", "signUp"]} />
      </div>
    </Stack>
  );
};
