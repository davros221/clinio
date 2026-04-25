import { memo } from "react";
import { useNavigate } from "react-router";
import { Box, Button, Stack } from "@mantine/core";
import { useT, useUserRole } from "@hooks";
import { OverviewHeader } from "../common/OverviewHeader.tsx";
import { OfficesOverviewOfficesTable } from "./OfficesOverviewOfficesTable.tsx";
import { ROUTER_PATHS } from "@router";

function OfficesOverviewComponent() {
  const t = useT();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();

  return (
    <Box>
      <Stack gap="md">
        <OverviewHeader
          title={t("office.overview.title")}
          action={
            isAdmin && (
              <Button onClick={() => navigate(ROUTER_PATHS.OFFICE_NEW)}>
                {t("office.form.title.create")}
              </Button>
            )
          }
        />

        <OfficesOverviewOfficesTable />
      </Stack>
    </Box>
  );
}

export const OfficesOverview = memo(OfficesOverviewComponent);
