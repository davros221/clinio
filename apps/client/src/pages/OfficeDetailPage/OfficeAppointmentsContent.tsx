import { useState } from "react";
import { Stack } from "@mantine/core";
import { useParams } from "react-router";
import { useGetCalendarQuery } from "@api";
import { useUserRole } from "@hooks";
import { Calendar } from "../../components/dashboard/Calendar";
import { AppointmentsOverviewTable } from "../../components/appointments/AppointmentsOverviewTable";
import { useOfficeDetailContext } from "./useOfficeDetailContext.ts";

export function OfficeAppointmentsContent() {
  const { id } = useParams<{ id: string }>();
  const { isStaff } = useUserRole();
  const { office } = useOfficeDetailContext();
  const [time, setTime] = useState(() => Date.now());

  const { data: calendarDays = [] } = useGetCalendarQuery(id ?? "", time, !!id);

  if (isStaff) {
    return (
      <Calendar
        calendarDays={calendarDays}
        officeName={office?.name ?? ""}
        weekTimestamp={time}
        onWeekTimestampChange={setTime}
      />
    );
  }

  return (
    <Stack gap="md">
      <AppointmentsOverviewTable officeId={id} />
    </Stack>
  );
}
