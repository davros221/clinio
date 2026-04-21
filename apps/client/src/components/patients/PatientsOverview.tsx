import { useState } from "react";
import { Box, Button, Group, Stack, Title } from "@mantine/core";
import { useT, useUser } from "@hooks";
import { CreateUserModal } from "../user/CreateUserModal/CreateUserModal.tsx";
import { DataTable } from "../DataTable";
import { usePatientOverview } from "./usePatientOverview.ts";

export function PatientsOverview() {
  const t = useT();
  const { user } = useUser();
  const [modalOpened, setModalOpened] = useState(false);
  const isAdmin = user?.role === "ADMIN";
  const mode = isAdmin ? "staff" : "patient";
  const { patientOverviewTableOptions } = usePatientOverview();

  return (
    <Box>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={1}>{t("patient.overview.title")}</Title>
          <Button size="xs" onClick={() => setModalOpened(true)}>
            {isAdmin ? t("user.form.title") : t("patient.form.title")}
          </Button>
        </Group>

        <DataTable {...patientOverviewTableOptions} />
      </Stack>

      <CreateUserModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        mode={mode}
      />
    </Box>
  );
}
