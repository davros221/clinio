import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarService, CalendarDay } from "@clinio/api";
import { Appointment } from "../components/utils/types";

function calendarToAppointments(days: CalendarDay[]): Appointment[] {
  return days.flatMap((day) =>
    day.hours.flatMap((h) => {
      if (h.state !== "BOOKED" || !h.appointment) return [];
      const appt = h.appointment;
      return [
        {
          id: appt.id,
          patientName: `${appt.patient.firstName} ${appt.patient.lastName}`,
          room: appt.doctor.specialization,
          roomNumber: 1,
          start: `${String(h.hour).padStart(2, "0")}:00`,
          duration: 60,
          day: day.day,
        },
      ];
    })
  );
}

export const useGetAppointmentsQuery = () => {
  return useQuery<Appointment[]>({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data } = await CalendarService.getCalendar({
        throwOnError: true,
      });
      return calendarToAppointments(data ?? []);
    },
  });
};

export const useMoveAppointmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_: { id: string; day: number; start: string }) => {
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

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["appointments"], context.previous);
      }
    },

    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
};
