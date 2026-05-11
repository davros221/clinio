import { useRescheduleAppointmentMutation } from "../api";
import { DateUtils } from "../utils";

export function useAppointmentMove(weekTimestamp: number) {
  const { mutate: reschedule } = useRescheduleAppointmentMutation();

  return (apptId: string, day: number, start: string) => {
    const weekStart = DateUtils.getWeekStart(0, new Date(weekTimestamp));
    const date = DateUtils.toIsoDate(DateUtils.getWeekDay(weekStart, day - 1));
    const hour = parseInt(start.split(":")[0], 10);
    reschedule({ id: apptId, dto: { date, hour } });
  };
}
