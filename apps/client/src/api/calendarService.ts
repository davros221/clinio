import { useQuery } from "@tanstack/react-query";
import { CalendarDay, CalendarService } from "@clinio/api";
import { calendarKeys } from "./queryKeys";

export const useGetCalendarQuery = (
  officeId: string,
  weekStart: Date,
  enabled: boolean
) => {
  return useQuery<CalendarDay[]>({
    queryKey: calendarKeys.list({ officeId, timestamp: weekStart.getTime() }),
    queryFn: async () => {
      const { data } = await CalendarService.getCalendar({
        query: { officeId, timestamp: weekStart.getTime() },
        throwOnError: true,
      });
      return data ?? [];
    },
    enabled,
  });
};
