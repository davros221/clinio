import { Center, Paper, Title, Text, Button } from "@mantine/core";
import { useNavigate } from "react-router";
import { ROUTER_PATHS } from "../router/routes.ts";

export const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <Center h="100dvh">
      <Paper withBorder shadow="md" p={40} radius="md" ta="center">
        <Title order={1} c="blue" mb="sm">
          403
        </Title>
        <Text fw={600} mb="xs">
          Access Forbidden
        </Text>
        <Text c="dimmed" size="sm" mb="xl">
          You do not have permission to access this page.
        </Text>
        <Button
          variant="light"
          onClick={() => navigate(ROUTER_PATHS.HOME, { replace: true })}
        >
          Go back home
        </Button>
      </Paper>
    </Center>
  );
};
