import { useState } from "react";
import { Box, Button, Group, Stack, Title } from "@mantine/core";
import { AppointmentsOverviewTable } from "./AppointmentsOverviewTable";
import { CreateAppointmentModal } from "./CreateAppointmentModal";
import { useT } from "@hooks";

export function AppointmentsOverview() {
  const t = useT();
  const [modalOpened, setModalOpened] = useState(false);

  return (
    <Box>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={1}>{t("appointment.overview.title")}</Title>
          <Button size="xs" onClick={() => setModalOpened(true)}>
            {t("appointment.createModal.title")}
          </Button>
        </Group>

        <AppointmentsOverviewTable />
      </Stack>

      <CreateAppointmentModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
      />
    </Box>
  );
}
