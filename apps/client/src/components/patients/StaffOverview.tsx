import { useState } from "react";
import { Box, Button, Stack } from "@mantine/core";
import { useT } from "@hooks";
import { OverviewHeader } from "../common/OverviewHeader.tsx";
import { CreateUserModal } from "../user/CreateUserModal/CreateUserModal.tsx";
import { DataTable } from "../DataTable";
import { useStaffOverview } from "./useStaffOverview.ts";

export function StaffOverview() {
  const t = useT();
  const [modalOpened, setModalOpened] = useState(false);
  const { staffOverviewTableOptions } = useStaffOverview();

  return (
    <Box>
      <Stack gap="md">
        <OverviewHeader
          title={t("nav.staff")}
          action={
            <Button onClick={() => setModalOpened(true)}>
              {t("user.form.title")}
            </Button>
          }
        />
        <DataTable {...staffOverviewTableOptions} />
      </Stack>

      <CreateUserModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        mode="staff"
      />
    </Box>
  );
}
