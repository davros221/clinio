import { memo } from "react";
import { useNavigate } from "react-router";
import { Box, Button, Group, Stack, Title } from "@mantine/core";
import { useT, useUserRole } from "@hooks";
import { OfficesOverviewOfficesTable } from "./OfficesOverviewOfficesTable.tsx";
import { ROUTER_PATHS } from "../../router/routes.ts";

function OfficesOverviewComponent() {
  const t = useT();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();

  return (
    <Box>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={1}>{t("office.overview.title")}</Title>

          {isAdmin && (
            <Button onClick={() => navigate(ROUTER_PATHS.OFFICE_NEW)}>
              {t("office.createOfficeModal.title.create")}
            </Button>
          )}
        </Group>

        <OfficesOverviewOfficesTable />
      </Stack>
    </Box>
  );
}

export const OfficesOverview = memo(OfficesOverviewComponent);
