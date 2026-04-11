import { Container, Group, Paper, Stack, Text } from "@mantine/core";
import { LanguageSwitcher } from "../LanguageSwitcher.tsx";
import { Outlet } from "react-router";

export const AuthLayout = () => {
  return (
    <Container>
      <Paper withBorder shadow={"md"} p={40} radius={"md"}>
        <Stack>
          <Group justify={"space-between"} align={"start"}>
            <Text size={"lg"} fw={700} mb={"xl"} c={"blue"}>
              ClinIO
            </Text>
            <LanguageSwitcher />
          </Group>
        </Stack>
        <Outlet />
      </Paper>
    </Container>
  );
};
