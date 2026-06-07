import { Stack, Alert, TextInput, Button, Group, Text } from "@mantine/core";
import { useT, useUserRole } from "@hooks";
import { useSettingsPage } from "./useSettingsPage.ts";
import {
  LanguageSwitcher,
  OverviewHeader,
  PhoneInputField,
  ShutdownSection,
} from "@components";

export const SettingsPage = () => {
  const t = useT();
  const { isOnboardingClient, isClient, isAdmin } = useUserRole();
  const { form, handleSubmit, isPending } = useSettingsPage();

  return (
    <Stack gap="md">
      <OverviewHeader title={t("nav.settings")} />

      <Group>
        <Text truncate="end" maw={220}>
          {t("settings.languageSwitch")}:
        </Text>

        <LanguageSwitcher />
      </Group>

      {(isClient || isOnboardingClient) && (
        <Stack maw={450}>
          {isOnboardingClient && (
            <Alert color="yellow" title={t("settings.onboardingWarningTitle")}>
              {t("settings.onboardingWarningMessage")}
            </Alert>
          )}

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
              <PhoneInputField
                label={t("patient.form.phone")}
                value={form.getValues().phone}
                onChange={(phone) => form.setFieldValue("phone", phone)}
                error={form.errors.phone as string}
              />
              <Button type="submit" loading={isPending}>
                {t("common.action.save")}
              </Button>
            </Stack>
          </form>
        </Stack>
      )}

      {isAdmin && <ShutdownSection />}
    </Stack>
  );
};
