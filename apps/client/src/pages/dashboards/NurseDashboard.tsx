import { Title, Stack, Loader, Alert } from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdErrorOutline } from "react-icons/md";
import { CalendarService, CalendarDay } from "@clinio/api";
import { QuickActions } from "../../components/dashboard/QuickActions";
import { WeekCalendar } from "../../components/dashboard/WeekCalendar";
import { Appointment } from "../../components/utils/types";

function calendarToAppointments(days: CalendarDay[]): Appointment[] {
  return days.flatMap((day) =>
    day.hours
      .filter((h) => h.state === "BOOKED" && h.appointment)
      .map((h) => ({
        id: h.appointment!.id,
        patientName: `${h.appointment!.patient.firstName} ${
          h.appointment!.patient.lastName
        }`,
        room: h.appointment!.doctor.specialization,
        roomNumber: 1,
        start: `${String(h.hour).padStart(2, "0")}:00`,
        duration: 60,
        day: day.day,
      }))
  );
}

export const NurseDashboard = () => {
  const queryClient = useQueryClient();

  const {
    data: appointments,
    isLoading,
    isError,
  } = useQuery<Appointment[]>({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data } = await CalendarService.getCalendar({
        throwOnError: true,
      });
      return calendarToAppointments(data ?? []);
    },
  });

  const moveMutation = useMutation({
    mutationFn: async (_vars: { id: string; day: number; start: string }) => {
      // Backend zatím nemá PATCH /api/appointments — přidat až bude endpoint
    },

    onMutate: async ({ id, day, start }) => {
      await queryClient.cancelQueries({ queryKey: ["appointments"] });
      const previous = queryClient.getQueryData<Appointment[]>([
        "appointments",
      ]);
      queryClient.setQueryData<Appointment[]>(
        ["appointments"],
        (old) => old?.map((a) => (a.id === id ? { ...a, day, start } : a)) ?? []
      );
      return { previous };
    },

    // Pokud API selže, vrátíme data do původního stavu
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["appointments"], context.previous);
      }
    },

    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  if (isLoading) return <Loader />;

  if (isError)
    return (
      <Alert icon={<MdErrorOutline size={16} />} color="red">
        Nepodařilo se načíst schůzky
      </Alert>
    );

  return (
    <Stack>
      <Title>Vítejte zpět!</Title>
      <QuickActions />
      <WeekCalendar
        appointments={appointments ?? []}
        onAppointmentMove={(id, day, start) =>
          moveMutation.mutate({ id, day, start })
        }
      />
    </Stack>
  );
};
