import { useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import {
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CalendarDay } from "@clinio/api";
import { CalendarSlot, HOURS } from "../components/utils/types";
import { useIntl } from "./useIntl";
import { DateUtils } from "@utils";

type UseCalendarOptions = {
  calendarDays: CalendarDay[];
  weekTimestampProp?: number;
  onWeekTimestampChange?: (timestamp: number) => void;
  onAppointmentMove?: (id: string, day: number, start: string) => void;
};

export const useCalendar = ({
  calendarDays,
  weekTimestampProp,
  onWeekTimestampChange,
  onAppointmentMove,
}: UseCalendarOptions) => {
  const { getDayName, formatDateTime } = useIntl();

  const [weekTimestampInternal, setWeekTimestampInternal] = useState(() =>
    Date.now()
  );
  const weekTimestamp = weekTimestampProp ?? weekTimestampInternal;
  const setWeekTimestamp = (next: number) => {
    setWeekTimestampInternal(next);
    onWeekTimestampChange?.(next);
  };

  const [selectedAppt, setSelectedAppt] = useState<CalendarSlot | null>(null);
  const [draggingAppt, setDraggingAppt] = useState<CalendarSlot | null>(null);
  const [mobileDayIdx, setMobileDayIdx] = useState(0);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const displayHours =
    calendarDays.find((d) => d.day < 5)?.hours.map((h) => h.hour) ?? HOURS;
  const gridStart = displayHours[0] * 60;

  const weekStart = DateUtils.getWeekStart(0, new Date(weekTimestamp));
  const weekEnd = DateUtils.getWeekDay(weekStart, 4);
  const visibleDayIndices = isMobile ? [mobileDayIdx] : [0, 1, 2, 3, 4];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setDraggingAppt(event.active.data.current?.appt as CalendarSlot);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingAppt(null);
    const { active, over } = event;
    if (!over) return;

    const parts = String(over.id).split("-");
    if (parts.length !== 3) return;

    const [dayIdx, hour, minute] = parts.map(Number);

    if (
      isNaN(dayIdx) ||
      isNaN(hour) ||
      isNaN(minute) ||
      dayIdx < 0 ||
      dayIdx > 4 ||
      hour < displayHours[0] ||
      hour > displayHours[displayHours.length - 1] ||
      (minute !== 0 && minute !== 30)
    )
      return;

    onAppointmentMove?.(
      String(active.id),
      dayIdx + 1,
      DateUtils.minutesToTime(hour * 60 + minute)
    );
  };

  const goToPrevWeek = () =>
    setWeekTimestamp(DateUtils.addWeeks(weekTimestamp, -1));
  const goToNextWeek = () =>
    setWeekTimestamp(DateUtils.addWeeks(weekTimestamp, 1));
  const goToToday = () => {
    setWeekTimestamp(Date.now());
    setMobileDayIdx(
      Math.min(DateUtils.isoWeekday(DateUtils.toIsoDate(new Date())), 4)
    );
  };

  return {
    selectedAppt,
    setSelectedAppt,
    draggingAppt,
    setDraggingAppt,
    mobileDayIdx,
    setMobileDayIdx,
    isMobile,
    displayHours,
    gridStart,
    weekStart,
    weekEnd,
    visibleDayIndices,
    sensors,
    handleDragStart,
    handleDragEnd,
    goToPrevWeek,
    goToNextWeek,
    goToToday,
    getDayName,
    formatDateTime,
  };
};
