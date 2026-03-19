import { Title, Stack, Loader, Alert } from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdErrorOutline } from "react-icons/md";
import { QuickActions } from "../../components/dashboard/QuickActions";
import { WeekCalendar } from "../../components/dashboard/WeekCalendar";
import { Appointment } from "../../components/utils/types";
import { mockAppointments } from "../../mocks/mockAppointments";

export const NurseDashboard = () => {
  const queryClient = useQueryClient();

  // Až bude backend, nahradit mockAppointments, TODOčka mi tu pripravilo neco AI jako bloker
  // tak uvidime jak bude vypadat BE
  const {
    data: appointments,
    isLoading,
    isError,
  } = useQuery<Appointment[]>({
    queryKey: ["appointments"],
    queryFn: async () => {
      // ── TODO: nahradit za skutečné API volání ────────────────────────
      // const res = await fetch("/api/appointments");
      // if (!res.ok) throw new Error("Nepodařilo se načíst schůzky");
      // return res.json();
      // ────────────────────────────────────────────────────────────────
      return mockAppointments;
    },
  });

  const moveMutation = useMutation({
    mutationFn: async ({
      id,
      day,
      start,
    }: {
      id: string;
      day: number;
      start: string;
    }) => {
      // ── TODO: nahradit za skutečné API volání ────────────────────────
      // const res = await fetch(`/api/appointments/${id}`, {
      //   method: "PATCH",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ day, start }),
      // });
      // if (!res.ok) throw new Error("Nepodařilo se přesunout schůzku");
      // return res.json();
      // ────────────────────────────────────────────────────────────────
      console.log("Přesun schůzky:", { id, day, start });
    },

    // TODO — zatím jen změna dat lokálně hned bez čekání na API
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

    // onSettled zatím odstraněno — invalidateQueries se přepisovalo zpět na mockdata, nšly posouvat schuzky
    // Přidat zpět až bude backend:
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
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
