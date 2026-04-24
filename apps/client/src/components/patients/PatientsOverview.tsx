import { useState } from "react";
import { Box, Button, Stack } from "@mantine/core";
import { useT, useUser } from "@hooks";
import { OverviewHeader } from "../common/OverviewHeader.tsx";
import { CreateUserModal } from "../user/CreateUserModal/CreateUserModal.tsx";
import { DataTable } from "../DataTable";
import { usePatientOverview } from "./usePatientOverview.ts";
import { useStaffOverview } from "./useStaffOverview.ts";

export function PatientsOverview() {
  const t = useT();
  const { user } = useUser();
  const [modalOpened, setModalOpened] = useState(false);
  const isAdmin = user?.role === "ADMIN";
  const mode = isAdmin ? "staff" : "patient";
  const { patientOverviewTableOptions } = usePatientOverview();
  const { staffOverviewTableOptions } = useStaffOverview();

  return (
    <Box>
      <Stack gap="md">
        <OverviewHeader
          title={t("patient.overview.title")}
          action={
            <Button onClick={() => setModalOpened(true)}>
              {isAdmin ? t("user.form.title") : t("patient.form.title")}
            </Button>
          }
        />

        {isAdmin ? (
          <DataTable {...staffOverviewTableOptions} />
        ) : (
          <DataTable {...patientOverviewTableOptions} />
        )}
      </Stack>

      <CreateUserModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        mode={mode}
      />
    </Box>
  );
}
