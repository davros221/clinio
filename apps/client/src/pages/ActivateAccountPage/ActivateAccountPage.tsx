import { PasswordInput, Stack, Title } from "@mantine/core";
import { useT } from "@hooks";
import { useActivateAccountPage } from "./useActivateAccountPage.ts";
import { SubmitButton } from "@components";

export const ActivateAccountPage = () => {
  const t = useT();
  const { handleSubmit, form } = useActivateAccountPage();

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={"md"} miw={260}>
        <Title ta="center" c="blue" order={1}>
          {t("common.auth.confirmPassword")}
        </Title>
        <PasswordInput
          label={t("common.auth.password")}
          {...form.getInputProps("password")}
        />
        <PasswordInput
          label={t("common.auth.passwordConfirmation")}
          {...form.getInputProps("passwordConfirm")}
        />
        <SubmitButton type={"submit"}>
          {t("common.action.activate")}
        </SubmitButton>
      </Stack>
    </form>
  );
};
