import { Title, Stack, Loader, Alert } from "@mantine/core";
import { MdErrorOutline } from "react-icons/md";
import { QuickActions } from "../../components/dashboard/QuickActions";
import { Calendar } from "../../components/dashboard/Calendar";
import { useT } from "../../hooks/useT";
import {
  useGetAppointmentsQuery,
  useMoveAppointmentMutation,
} from "../../api/appointmentApi";

export const NurseDashboard = () => {
  const t = useT();

  const { data: appointments, isLoading, isError } = useGetAppointmentsQuery();
  const moveMutation = useMoveAppointmentMutation();

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <Alert icon={<MdErrorOutline size={16} />} color="red">
        {t("appointments.errorLoadingAppointments")}
      </Alert>
    );
  }

  return (
    <Stack>
      <Title>{t("nurseDashboard.title")}</Title>
      <QuickActions />
      <Calendar
        appointments={appointments ?? []}
        onAppointmentMove={(id, day, start) =>
          moveMutation.mutate({ id, day, start })
        }
      />
    </Stack>
  );
};
