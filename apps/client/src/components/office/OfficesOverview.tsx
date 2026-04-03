import { memo } from "react";
import { Box, Group, Stack, Title } from "@mantine/core";
import { ManageOfficeModalOpenBtn } from "./ManageOfficeModal/ManageOfficeModalOpenBtn.tsx";
import { useT } from "../../hooks/useT";
import { OfficesOverviewOfficesTable } from "./OfficesOverviewOfficesTable.tsx";

function OfficesOverviewComponent() {
  const t = useT();
  return (
    <Box>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={1}>{t("office.overview.title")}</Title>

          <ManageOfficeModalOpenBtn />
        </Group>

        <OfficesOverviewOfficesTable />
      </Stack>
    </Box>
  );
}

export const OfficesOverview = memo(OfficesOverviewComponent);
