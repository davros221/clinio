import { useState, useMemo } from "react";
import { Button, Text, Group, Stack, Paper } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { AppointmentCard } from "./AppointmentCard";
import { AppointmentModal } from "./AppointmentModal";
import { CalendarHeader } from "./CalendarHeader";
import { DroppableSlot } from "./DroppableSlot";
import {
  CalendarSlot,
  CAP_WORK_DAYS,
  HOURS,
  SLOT_HEIGHT,
} from "../utils/types";
import "./Calendar.css";
import { useT } from "@hooks";
import { DateUtils } from "@utils";

type Props = {
  appointments: CalendarSlot[];
  // Callback when moving appointment by d&d — parent will provide API call
  onAppointmentMove?: (id: string, day: number, start: string) => void;
  weekOffset?: number;
  onWeekOffsetChange?: (offset: number) => void;
};

/**
 * Responsive week-view calendar for scheduling appointments.
 * Supports drag-and-drop rescheduling, room color coding, and mobile single-day navigation.
 */
export const Calendar = ({
  appointments,
  onAppointmentMove,
  weekOffset: weekOffsetProp,
  onWeekOffsetChange,
}: Props) => {
  const t = useT();
  const [weekOffsetInternal, setWeekOffsetInternal] = useState(0);
  const weekOffset = weekOffsetProp ?? weekOffsetInternal;
  const setWeekOffset = (updater: number | ((prev: number) => number)) => {
    const next = typeof updater === "function" ? updater(weekOffset) : updater;
    setWeekOffsetInternal(next);
    onWeekOffsetChange?.(next);
  };
  const [selectedAppt, setSelectedAppt] = useState<CalendarSlot | null>(null);
  const [draggingAppt, setDraggingAppt] = useState<CalendarSlot | null>(null);
  const [mobileDayIdx, setMobileDayIdx] = useState(0);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const weekStart = useMemo(
    () => DateUtils.getWeekStart(weekOffset),
    [weekOffset]
  );

  const weekEnd = useMemo(
    () => DateUtils.getWeekDay(weekStart, 4),
    [weekStart]
  );

  // Recalculated only when isMobile or mobileDayIdx changes
  const visibleDayIndices = useMemo(
    () => (isMobile ? [mobileDayIdx] : [0, 1, 2, 3, 4]),
    [isMobile, mobileDayIdx]
  );

  // Start of grid in minutes — never changes
  const gridStart = useMemo(() => HOURS[0] * 60, []);

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
      hour < 7 ||
      hour > 17 ||
      (minute !== 0 && minute !== 30)
    )
      return;

    const newDay = dayIdx + 1;
    const newStart = DateUtils.minutesToTime(hour * 60 + minute);

    onAppointmentMove?.(String(active.id), newDay, newStart);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Stack
        gap="sm"
        className="calendar"
        style={
          {
            "--cal-col-width": `calc((100% - 48px) / ${visibleDayIndices.length})`,
          } as React.CSSProperties
        }
      >
        {/* Week Navigation */}
        <Group justify="center" gap="xs" className="calendar__week-nav">
          <Button
            variant="default"
            size="xs"
            onClick={() => setWeekOffset((o) => o - 1)}
          >
            ←
          </Button>
          <Text size="sm" fw={500} w={170} ta="center">
            {DateUtils.fmt(weekStart)} – {DateUtils.fmt(weekEnd)}{" "}
            {weekEnd.getFullYear()}
          </Text>
          <Button
            variant="default"
            size="xs"
            onClick={() => setWeekOffset((o) => o + 1)}
          >
            →
          </Button>
          <Button
            variant="subtle"
            size="xs"
            onClick={() => setWeekOffset(0)}
            className="calendar__today-btn"
          >
            {t("calendar.today")}
          </Button>
        </Group>

        {/* Days Navigation — only on mobile */}
        {isMobile && (
          <Group justify="center" gap="xs">
            <Button
              variant="default"
              size="xs"
              disabled={mobileDayIdx === 0}
              onClick={() => setMobileDayIdx((d) => Math.max(0, d - 1))}
            >
              ←
            </Button>
            <Text size="sm" fw={500} w={170} ta="center">
              {CAP_WORK_DAYS[mobileDayIdx]}
            </Text>
            <Button
              variant="default"
              size="xs"
              disabled={mobileDayIdx === 4}
              onClick={() => setMobileDayIdx((d) => Math.min(4, d + 1))}
            >
              →
            </Button>
          </Group>
        )}

        {/* Table */}
        <div className="week-table">
          <CalendarHeader
            weekStart={weekStart}
            visibleDayIndices={visibleDayIndices}
          />

          <div
            className="week-table__body"
            style={{
              gridTemplateColumns: `48px repeat(${visibleDayIndices.length}, 1fr)`,
            }}
          >
            {/* Time Axis */}
            <div className="week-table__time-axis">
              {HOURS.map((hour) => (
                <div key={hour} className="week-table__hour-label">
                  {hour}:00
                </div>
              ))}
            </div>

            {/* Days - columns */}
            {visibleDayIndices.map((dayIdx) => {
              const dayAppts = appointments.filter((a) => a.day === dayIdx + 1);
              return (
                <div key={dayIdx} className="week-table__day-col">
                  {/* Half-hour droppable slots */}
                  {HOURS.map((hour) => (
                    <div key={hour} className="week-table__hour-row">
                      <DroppableSlot dayIdx={dayIdx} hour={hour} minute={0} />
                      <DroppableSlot dayIdx={dayIdx} hour={hour} minute={30} />
                    </div>
                  ))}

                  {/* CalendarSlots */}
                  {dayAppts.map((appt) => {
                    const top =
                      ((DateUtils.timeToMinutes(appt.start) - gridStart) / 60) *
                      SLOT_HEIGHT;
                    const height = (appt.duration / 60) * SLOT_HEIGHT;
                    return (
                      <AppointmentCard
                        key={appt.id}
                        appt={appt}
                        top={top}
                        height={height}
                        onClick={() => setSelectedAppt(appt)}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* DragOverlay */}
        <DragOverlay>
          {draggingAppt &&
            (() => {
              const height = (draggingAppt.duration / 60) * SLOT_HEIGHT;
              return (
                <Paper
                  shadow="md"
                  radius="sm"
                  className="week-table__drag-overlay"
                  style={{
                    background: "var(--mantine-color-blue-6)",
                    color: "var(--mantine-color-white)",
                    height: height - 2,
                  }}
                >
                  <span>{draggingAppt.patientName}</span>
                  <span className="week-table__drag-overlay-room">
                    {draggingAppt.start} · {draggingAppt.room}
                  </span>
                </Paper>
              );
            })()}
        </DragOverlay>

        {/* Modal */}
        <AppointmentModal
          appt={selectedAppt}
          onClose={() => setSelectedAppt(null)}
        />
      </Stack>
    </DndContext>
  );
};
