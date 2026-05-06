import { useQuery } from "@tanstack/react-query";
import { CalendarDay, CalendarService } from "@clinio/api";
import { calendarKeys } from "./queryKeys";

export const useGetCalendarQuery = (
  officeId: string,
  timestamp: number,
  enabled: boolean
) => {
  return useQuery<CalendarDay[]>({
    queryKey: calendarKeys.list({ officeId, timestamp }),
    queryFn: async () => {
      const { data } = await CalendarService.getCalendar({
        query: { officeId, timestamp },
      });
      return data ?? [];
    },
    enabled,
  });
};
