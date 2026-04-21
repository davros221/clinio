import { Stack, Title, Alert, TextInput, Button } from "@mantine/core";
import { useT, useUserRole } from "@hooks";
import { useSettingsPage } from "./useSettingsPage.ts";

export const SettingsPage = () => {
  const t = useT();
  const { isOnboardingClient } = useUserRole();
  const { form, handleSubmit, isPending } = useSettingsPage();

  return (
    <Stack maw={450}>
      <Title order={2}>{t("nav.settings")}</Title>

      {isOnboardingClient && (
        <>
          <Alert color="yellow" title={t("settings.onboardingWarningTitle")}>
            {t("settings.onboardingWarningMessage")}
          </Alert>

          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput
                label={t("patient.form.birthNumber")}
                placeholder="9001011234"
                {...form.getInputProps("birthNumber")}
              />
              <TextInput
                type="date"
                label={t("patient.form.birthdate")}
                {...form.getInputProps("birthdate")}
              />
              <TextInput
                label={t("patient.form.phone")}
                placeholder="+420111222333"
                {...form.getInputProps("phone")}
              />
              <Button type="submit" loading={isPending}>
                {t("common.action.save")}
              </Button>
            </Stack>
          </form>
        </>
      )}
    </Stack>
  );
};
