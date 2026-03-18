import { Title, Stack } from "@mantine/core";
import { QuickActions } from "../../components/dashboard/QuickActions";
import { WeekCalendar } from "../../components/dashboard/WeekCalendar";

export const NurseDashboard = () => {
  return (
    <Stack>
      <Title>Vítejte zpět!</Title>
      <QuickActions />
      <WeekCalendar />
    </Stack>
  );
};
