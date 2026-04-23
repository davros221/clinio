import { Center, Text } from "@mantine/core";
import { useT } from "@hooks";

export function SettingsPage() {
  const t = useT();
  return (
    <Center h="50vh">
      <Text c="dimmed">{t("common.comingSoon")}</Text>
    </Center>
  );
}
