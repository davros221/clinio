import { useState } from "react";
import { Box, Button, Select, Stack } from "@mantine/core";
import { AppointmentsOverviewTable } from "./AppointmentsOverviewTable";
import { CreateAppointmentModal } from "./CreateAppointmentModal";
import { Calendar } from "../dashboard/Calendar";
import { useGetCalendarQuery, useGetOfficeListQuery } from "@api";
import { useT, useUserRole } from "@hooks";
import { OverviewHeader } from "../common/OverviewHeader.tsx";

export function AppointmentsOverview() {
  const t = useT();
  const { isStaff } = useUserRole();
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [time, setTime] = useState(() => Date.now());

  const { data: offices = [] } = useGetOfficeListQuery();

  const { data: calendarDays = [] } = useGetCalendarQuery(
    selectedOfficeId!,
    time,
    !!selectedOfficeId
  );

  const officeName = offices.find((o) => o.id === selectedOfficeId)?.name ?? "";

  return (
    <Box>
      <Stack gap="md">
        <OverviewHeader
          title={t("appointment.overview.title")}
          action={
            <Button onClick={() => setModalOpened(true)}>
              {t("appointment.createModal.title")}
            </Button>
          }
        />

        {isStaff ? (
          <Stack gap="md">
            <Select
              label={t("appointment.createModal.fields.office")}
              placeholder={t(
                "appointment.createModal.fields.officePlaceholder"
              )}
              data={offices.map((o) => ({ value: o.id, label: o.name }))}
              value={selectedOfficeId}
              onChange={setSelectedOfficeId}
              w={300}
            />
            <Calendar
              calendarDays={calendarDays}
              officeName={officeName}
              weekTimestamp={time}
              onWeekTimestampChange={setTime}
            />
          </Stack>
        ) : (
          <AppointmentsOverviewTable />
        )}
      </Stack>

      <CreateAppointmentModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
      />
    </Box>
  );
}
