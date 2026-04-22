import { useState } from "react";
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
import { CalendarDay } from "@clinio/api";
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
  calendarDays: CalendarDay[];
  officeName?: string;
  onAppointmentMove?: (id: string, day: number, start: string) => void;
  weekTimestamp?: number;
  onWeekTimestampChange?: (timestamp: number) => void;
};

/**
 * Responsive week-view calendar for scheduling appointments.
 * Supports drag-and-drop rescheduling, room color coding, and mobile single-day navigation.
 */
export const Calendar = ({
  calendarDays,
  officeName = "",
  onAppointmentMove,
  weekTimestamp: weekTimestampProp,
  onWeekTimestampChange,
}: Props) => {
  const t = useT();
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

  // All days share the same hour range — take from first available weekday
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
            onClick={() =>
              setWeekTimestamp(DateUtils.addWeeks(weekTimestamp, -1))
            }
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
            onClick={() =>
              setWeekTimestamp(DateUtils.addWeeks(weekTimestamp, 1))
            }
          >
            →
          </Button>
          <Button
            variant="subtle"
            size="xs"
            className="calendar__today-btn"
            onClick={() => {
              setWeekTimestamp(Date.now());
              setMobileDayIdx(
                Math.min(
                  DateUtils.isoWeekday(DateUtils.toIsoDate(new Date())),
                  4
                )
              );
            }}
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
              {displayHours.map((hour) => (
                <div key={hour} className="week-table__hour-label">
                  {hour}:00
                </div>
              ))}
            </div>

            {/* Day columns */}
            {visibleDayIndices.map((dayIdx) => {
              const day = calendarDays.find((d) => d.day === dayIdx);
              return (
                <div key={dayIdx} className="week-table__day-col">
                  {/* Droppable slots */}
                  {day?.hours.map((slot) => (
                    <div key={slot.hour} className="week-table__hour-row">
                      <DroppableSlot
                        dayIdx={dayIdx}
                        hour={slot.hour}
                        minute={0}
                        closed={slot.state === "CLOSED"}
                      />
                      <DroppableSlot
                        dayIdx={dayIdx}
                        hour={slot.hour}
                        minute={30}
                        closed={slot.state === "CLOSED"}
                      />
                    </div>
                  ))}

                  {/* Appointment cards */}
                  {day?.hours
                    .filter(
                      (slot) => slot.state === "BOOKED" && slot.appointment
                    )
                    .map((slot) => {
                      const appt: CalendarSlot = {
                        id: slot.appointment!.id,
                        patientName: slot.appointment!.patient
                          ? `${slot.appointment!.patient.firstName} ${
                              slot.appointment!.patient.lastName
                            }`.trim()
                          : "Pacient",
                        room: officeName,
                        start: `${String(slot.hour).padStart(2, "0")}:00`,
                        duration: 60,
                        day: dayIdx + 1,
                        note: slot.appointment!.note,
                      };
                      return (
                        <AppointmentCard
                          key={slot.hour}
                          appt={appt}
                          top={
                            ((slot.hour * 60 - gridStart) / 60) * SLOT_HEIGHT
                          }
                          height={SLOT_HEIGHT}
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
          {draggingAppt && (
            <Paper
              shadow="md"
              radius="sm"
              className="week-table__drag-overlay"
              style={{
                background: "var(--mantine-color-blue-6)",
                color: "var(--mantine-color-white)",
                height: SLOT_HEIGHT - 2,
              }}
            >
              <span>{draggingAppt.patientName}</span>
              <span className="week-table__drag-overlay-room">
                {draggingAppt.start} · {draggingAppt.room}
              </span>
            </Paper>
          )}
        </DragOverlay>

        <AppointmentModal
          appt={selectedAppt}
          onClose={() => setSelectedAppt(null)}
        />
      </Stack>
    </DndContext>
  );
};
