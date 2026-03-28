import { SimpleGrid, Card, Text, Button, Group } from "@mantine/core";
import { NavLink } from "react-router";
import { ROUTER_PATHS } from "../../router/routes.ts";
import { useT } from "../../hooks/useT.ts";

export const QuickActions = () => {
  const t = useT();

  return (
    <SimpleGrid cols={3} mb="xl">
      <Card withBorder shadow="sm">
        <Text fw={600}>{t("quickActions.offices")}</Text>
        <Text size="sm" c="dimmed">
          {t("quickActions.officesDescription")}
        </Text>
        <Group justify="flex-end" mt="sm">
          <Button
            component={NavLink}
            to={ROUTER_PATHS.OFFICES}
            variant="default"
            size="xs"
          >
            {t("quickActions.show")}
          </Button>
        </Group>
      </Card>

      <Card withBorder shadow="sm">
        <Text fw={600}>{t("quickActions.patients")}</Text>
        <Text size="sm" c="dimmed">
          {t("quickActions.patientsDescription")}
        </Text>
        <Group justify="flex-end" mt="sm">
          <Button
            component={NavLink}
            to={ROUTER_PATHS.PATIENTS}
            variant="default"
            size="xs"
          >
            {t("quickActions.show")}
          </Button>
        </Group>
      </Card>

      <Card withBorder shadow="sm">
        <Text fw={600} c="green">
          {t("quickActions.newAppointment")}
        </Text>
        <Text size="sm" c="dimmed">
          {t("quickActions.newAppointmentDescription")}
        </Text>
        <Group justify="flex-end" mt="sm">
          <Button variant="filled" color="green" size="xs">
            {t("quickActions.add")}
          </Button>
        </Group>
      </Card>
    </SimpleGrid>
  );
};
