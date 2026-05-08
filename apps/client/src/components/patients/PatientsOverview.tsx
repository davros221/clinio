import { useState } from "react";
import { Box, Button, Stack } from "@mantine/core";
import { useT } from "@hooks";
import { OverviewHeader } from "../common/OverviewHeader.tsx";
import { CreateUserModal } from "../user/CreateUserModal/CreateUserModal.tsx";
import { DataTable } from "../DataTable";
import { usePatientOverview } from "./usePatientOverview.ts";

export function PatientsOverview() {
  const t = useT();
  const [modalOpened, setModalOpened] = useState(false);
  const { patientOverviewTableOptions } = usePatientOverview();

  return (
    <Box>
      <Stack gap="md">
        <OverviewHeader
          title={t("patient.overview.title")}
          action={
            <Button onClick={() => setModalOpened(true)}>
              {t("patient.form.title")}
            </Button>
          }
        />
        <DataTable {...patientOverviewTableOptions} />
      </Stack>

      <CreateUserModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        mode="patient"
      />
    </Box>
  );
}
