import { useState } from "react";
import { useNavigate } from "react-router";
import { Box, Button, Select, Stack } from "@mantine/core";
import { AppointmentsOverviewTable } from "./AppointmentsOverviewTable";
import { CreateAppointmentModal } from "./CreateAppointmentModal";
import { Calendar } from "../dashboard/Calendar";
import { useGetCalendarQuery, useGetOfficeListQuery } from "@api";
import { useT, useUserRole, useAppointmentMove } from "@hooks";
import { OverviewHeader } from "../common/OverviewHeader.tsx";
import { ROUTER_PATHS } from "@router";

export function CalendarOverview() {
  const t = useT();
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [time, setTime] = useState(() => Date.now());

  const { data: offices = [] } = useGetOfficeListQuery();
  const handleAppointmentMove = useAppointmentMove(time);
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
          title={t("nav.calendar")}
          action={
            <Button onClick={() => setModalOpened(true)}>
              {t("appointment.createModal.title")}
            </Button>
          }
        />
        <Select
          label={t("appointment.createModal.fields.office")}
          placeholder={t("appointment.createModal.fields.officePlaceholder")}
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
          onAppointmentMove={handleAppointmentMove}
        />
      </Stack>
      <CreateAppointmentModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        preselectedOfficeId={selectedOfficeId ?? undefined}
      />
    </Box>
  );
}

export function AppointmentsOverview() {
  const t = useT();
  const navigate = useNavigate();
  const { isStaff } = useUserRole();

  if (isStaff) {
    return <CalendarOverview />;
  }

  return (
    <Box>
      <Stack gap="md">
        <OverviewHeader
          title={t("appointment.overview.title")}
          action={
            <Button
              onClick={() => navigate(ROUTER_PATHS.APPOINTMENTS_CALENDAR)}
            >
              {t("nav.calendar")}
            </Button>
          }
        />
        <AppointmentsOverviewTable />
      </Stack>
    </Box>
  );
}
