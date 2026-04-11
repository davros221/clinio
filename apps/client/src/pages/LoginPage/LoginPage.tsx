import {
  TextInput,
  PasswordInput,
  Anchor,
  Title,
  Stack,
  Center,
  Group,
  Button,
} from "@mantine/core";
import { useT } from "../../hooks/useT.ts";
import { useLoginPage } from "./useLoginPage.ts";

const FORM_ID = "loginForm";

export const LoginPage = () => {
  const t = useT();
  const { handleSignUp, handleSubmit, form, isLoading } = useLoginPage();
  return (
    <>
      <Title ta="center" c="blue" order={1} mb="xl">
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

      <Button
        fullWidth
        mt={"xl"}
        variant={"outlint"}
        radius={"xl"}
        size={"md"}
        type={"submit"}
        loading={isLoading}
        form={FORM_ID}
      >
        {t("login.submitButton")}
      </Button>

      <Center mt="md">
        <Group gap="xs">
          <Anchor
            component="button"
            size="sm"
            c="dimmed"
            // onClick={handleForgetPassword}
          >
            {t("login.forgotPassword")}
          </Anchor>

          <Anchor
            component="button"
            size="sm"
            c="dimmed"
            onClick={handleSignUp}
          >
            {t("login.signUp")}
          </Anchor>
        </Group>
      </Center>
    </>
  );
};
