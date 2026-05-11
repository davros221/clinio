import { useState } from "react";
import { Stack, Button, Group } from "@mantine/core";
import { useParams } from "react-router";
import { useGetCalendarQuery } from "@api";
import { useAppointmentMove, useT } from "@hooks";
import { Calendar } from "../../components/dashboard/Calendar";
import { CreateAppointmentModal } from "../../components/appointments/CreateAppointmentModal";
import { useOfficeDetailContext } from "./useOfficeDetailContext.ts";

export function OfficeAppointmentsContent() {
  const { id } = useParams<{ id: string }>();
  const { office } = useOfficeDetailContext();
  const [time, setTime] = useState(() => Date.now());
  const [modalOpened, setModalOpened] = useState(false);
  const handleAppointmentMove = useAppointmentMove(time);
  const t = useT();

  const { data: calendarDays = [] } = useGetCalendarQuery(id ?? "", time, !!id);

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button onClick={() => setModalOpened(true)}>
          {t("appointment.createModal.title")}
        </Button>
      </Group>
      <Calendar
        calendarDays={calendarDays}
        officeName={office?.name ?? ""}
        weekTimestamp={time}
        onWeekTimestampChange={setTime}
        onAppointmentMove={handleAppointmentMove}
      />
      <CreateAppointmentModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        preselectedOfficeId={id}
      />
    </Stack>
  );
}
