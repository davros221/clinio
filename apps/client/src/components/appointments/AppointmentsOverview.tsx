import { useState, useMemo } from "react";
import { Box, Button, Group, Select, Stack, Title } from "@mantine/core";
import { AppointmentsOverviewTable } from "./AppointmentsOverviewTable";
import { CreateAppointmentModal } from "./CreateAppointmentModal";
import { Calendar } from "../dashboard/Calendar";
import { Appointment } from "../utils/types";
import {
  useGetAppointmentListQuery,
  useGetOfficeListQuery,
  useGetPatientsQuery,
} from "@api";
import { useT, useUser, useUserRole } from "@hooks";
import { DateUtils } from "@utils";

export function AppointmentsOverview() {
  const t = useT();
  const { isStaff } = useUserRole();
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const { user } = useUser();
  const currentUserId = user?.id ?? null;
  const { data: offices = [] } = useGetOfficeListQuery();
  const { data: patients = [] } = useGetPatientsQuery(isStaff);

  const nurseOffices = useMemo(
    () =>
      isStaff && currentUserId
        ? offices.filter((o) => o.staffIds.includes(currentUserId))
        : offices,
    [offices, isStaff, currentUserId]
  );

  const { data: apiAppointments = [] } = useGetAppointmentListQuery(
    isStaff && selectedOfficeId ? { officeId: selectedOfficeId } : undefined,
    isStaff ? !!selectedOfficeId : true
  );

  const weekStart = DateUtils.getWeekStart(weekOffset);

  const calendarAppointments: Appointment[] = useMemo(() => {
    const weekDates = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return DateUtils.toIsoDate(d);
    });

    return apiAppointments
      .filter((appt) => weekDates.includes(appt.date))
      .map((appt) => {
        const office = offices.find((o) => o.id === appt.officeId);
        const officeName = office?.name ?? "Ordinace 1";
        const roomNumberMatch = officeName.match(/\d+/);
        const roomNumber = roomNumberMatch ? Number(roomNumberMatch[0]) : 1;

        const dayIndex = weekDates.indexOf(appt.date);

        const patient = patients.find(
          (p) => p.id === (appt.patientId as unknown as string)
        );
        const patientName = patient
          ? `${patient.firstName} ${patient.lastName}`.trim()
          : "Pacient";

        return {
          id: appt.id,
          patientName,
          room: officeName,
          roomNumber,
          start: `${String(appt.hour).padStart(2, "0")}:00`,
          duration: 60,
          day: dayIndex + 1,
        };
      });
  }, [apiAppointments, offices, patients, weekStart]);

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
              data={nurseOffices.map((o) => ({ value: o.id, label: o.name }))}
              value={selectedOfficeId}
              onChange={setSelectedOfficeId}
              w={300}
            />
            <Calendar
              appointments={calendarAppointments}
              weekOffset={weekOffset}
              onWeekOffsetChange={setWeekOffset}
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
