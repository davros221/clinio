import { Button, Center, Group, Stack, Title } from "@mantine/core";
import { useNavigate } from "react-router";
import { ROUTER_PATHS } from "@router";
import { useT } from "@hooks";

export const NotFoundErrorPage = () => {
  const navigate = useNavigate();
  const t = useT();

  const navToHome = () => {
    navigate(ROUTER_PATHS.HOME);
  };

  return (
    <Center h={"100%"}>
      <Stack align="center" gap="xl">
        <Title order={2}>{t("common.notFoundPage.title")}</Title>
        <Group gap="md">
          <Button onClick={navToHome}>
            {t("common.notFoundPage.backHome")}
          </Button>
        </Group>
      </Stack>
    </Center>
  );
};
