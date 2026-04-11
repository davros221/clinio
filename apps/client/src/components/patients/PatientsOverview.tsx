import { useState } from "react";
import { Box, Button, Group, Stack, Title } from "@mantine/core";
import { PatientsOverviewTable } from "./PatientsOverviewTable";
import { CreateUserModal } from "./CreateUserModal";
import { useT } from "../../hooks/useT";
import { useUser } from "../../hooks/useUser";

export function PatientsOverview() {
  const t = useT();
  const user = useUser();
  const [modalOpened, setModalOpened] = useState(false);
  const isAdmin = user?.role === "ADMIN";
  const mode = isAdmin ? "staff" : "patient";

  return (
    <Box>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={1}>{t("patient.overview.title")}</Title>
          <Button size="xs" onClick={() => setModalOpened(true)}>
            {isAdmin ? t("user.form.title") : t("patient.form.title")}
          </Button>
        </Group>

        <PatientsOverviewTable />
      </Stack>

      <CreateUserModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        mode={mode}
      />
    </Box>
  );
}
