import { Center, Paper, Title, Text, Button } from "@mantine/core";
import { useNavigate } from "react-router";
import { ROUTER_PATHS } from "@router";
import { useT } from "../hooks/useT.ts";

export const ForbiddenPage = () => {
  const navigate = useNavigate();
  const t = useT();

  return (
    <Center h="100dvh">
      <Paper withBorder shadow="md" p={40} radius="md" ta="center">
        <Title order={1} c="blue" mb="sm">
          403
        </Title>
        <Text fw={600} mb="xs">
          {t("common.forbidden")}
        </Text>
        <Text c="dimmed" size="sm" mb="xl">
          {t("common.forbiddenMessage")}
        </Text>
        <Button
          variant="light"
          onClick={() => navigate(ROUTER_PATHS.HOME, { replace: true })}
        >
          {t("common.returnHome")}
        </Button>
      </Paper>
    </Center>
  );
};
