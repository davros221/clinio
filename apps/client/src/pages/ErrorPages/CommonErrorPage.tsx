import { Button, Center, Group, Stack, Title } from "@mantine/core";
import { useNavigate } from "react-router";
import { ROUTER_PATHS } from "@router";
import { useT } from "@hooks";

export const CommonErrorPage = () => {
  const navigate = useNavigate();
  const t = useT();

  const navToHome = () => {
    navigate(ROUTER_PATHS.HOME);
  };
  return (
    <Center h={"100%"}>
      <Stack align="center" gap="xl">
        <Title order={2}>{t("common.errorPage.title")}</Title>
        <Group gap="md">
          <Button onClick={navToHome}>
            {t("common.errorPage.backToDashboard")}
          </Button>
        </Group>
      </Stack>
    </Center>
  );
};
