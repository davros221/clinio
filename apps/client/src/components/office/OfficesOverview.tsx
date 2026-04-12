import { memo } from "react";
import { Box, Group, Stack, Title } from "@mantine/core";
import { ManageOfficeModalOpenBtn } from "./ManageOfficeModal/ManageOfficeModalOpenBtn.tsx";
import { useT, useUserRole } from "@hooks";
import { OfficesOverviewOfficesTable } from "./OfficesOverviewOfficesTable.tsx";

function OfficesOverviewComponent() {
  const t = useT();
  const { isAdmin } = useUserRole();

  return (
    <Box>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={1}>{t("office.overview.title")}</Title>

          {isAdmin && <ManageOfficeModalOpenBtn />}
        </Group>

        <OfficesOverviewOfficesTable />
      </Stack>
    </Box>
  );
}

export const OfficesOverview = memo(OfficesOverviewComponent);
