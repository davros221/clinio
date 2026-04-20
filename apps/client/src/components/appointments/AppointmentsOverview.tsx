import { useState, useMemo } from "react";
import { Box, Button, Group, Select, Stack, Title } from "@mantine/core";
import { AppointmentsOverviewTable } from "./AppointmentsOverviewTable";
import { CreateAppointmentModal } from "./CreateAppointmentModal";
import { Calendar } from "../dashboard/Calendar";
import { CalendarSlot } from "../utils/types";
import { useGetCalendarQuery, useGetOfficeListQuery } from "@api";
import { useT, useUserRole } from "@hooks";

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

  const calendarSlots: CalendarSlot[] = useMemo(() => {
    return calendarDays
      .filter((day) => day.day < 5)
      .flatMap((day) =>
        day.hours
          .filter((h) => h.state === "BOOKED" && h.appointment)
          .map((h) => ({
            id: h.appointment!.id,
            patientName: h.appointment!.patient
              ? `${h.appointment!.patient.firstName} ${
                  h.appointment!.patient.lastName
                }`.trim()
              : "Pacient",
            room: officeName,
            start: `${String(h.hour).padStart(2, "0")}:00`,
            duration: 60,
            day: day.day + 1,
            note: h.appointment!.note,
          }))
      );
  }, [calendarDays, officeName]);

  return (
    <Box>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={1}>{t("appointment.overview.title")}</Title>
          <Button size="xs" onClick={() => setModalOpened(true)}>
            {t("appointment.createModal.title")}
          </Button>
        </Group>

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
              appointments={calendarSlots}
              weekTimestamp={time}
              onWeekTimestampChange={setTime}
              calendarDays={calendarDays}
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
