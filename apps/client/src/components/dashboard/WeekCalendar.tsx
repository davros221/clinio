import { useState } from "react";
import { Button, Text, Group, Stack, Paper } from "@mantine/core";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import { mockAppointments } from "../../mocks/mockAppointments";
import { AppointmentCard } from "./AppointmentCard";
import { AppointmentModal } from "./AppointmentModal";
import { CalendarHeader } from "./CalendarHeader.tsx";
import { CalendarLegend } from "./CalendarLegend.tsx";
import {
  Appointment,
  DAYS,
  HOURS,
  SLOT_HEIGHT,
  ROOM_COLORS,
  getWeekStart,
  timeToMinutes,
  minutesToTime,
  fmt,
} from "./types.ts";

// Droppable slot po půlhodinkách ────────────────────────────────────────────────

const DroppableSlot = ({
  dayIdx,
  hour,
  minute,
}: {
  dayIdx: number;
  hour: number;
  minute: 0 | 30;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${dayIdx}-${hour}-${minute}`,
  });
  return (
    <div
      ref={setNodeRef}
      className={[
        "week-table__half-slot",
        minute === 30 ? "week-table__half-slot--bottom" : "",
        isOver ? "week-table__half-slot--over" : "",
      ].join(" ")}
    />
  );
};

export const WeekCalendar = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [appointments, setAppointments] =
    useState<Appointment[]>(mockAppointments);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [draggingAppt, setDraggingAppt] = useState<Appointment | null>(null);

  const weekStart = getWeekStart(weekOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 4);
  const gridStart = HOURS[0] * 60;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setDraggingAppt(event.active.data.current?.appt as Appointment);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingAppt(null);
    const { active, over } = event;
    if (!over) return;

    const [dayIdxStr, hourStr, minuteStr] = String(over.id).split("-");
    const newDay = parseInt(dayIdxStr) + 1;
    const newStart = minutesToTime(
      parseInt(hourStr) * 60 + parseInt(minuteStr)
    );

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === active.id ? { ...a, day: newDay, start: newStart } : a
      )
    );

    // ── TODO: API volání ──────────────────────────────────────────────────────
    // await fetch(`/api/appointments/${active.id}`, {
    //   method: "PATCH",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ day: newDay, start: newStart }),
    // });
    // ─────────────────────────────────────────────────────────────────────────
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Stack gap="sm" className="week-calendar">
        {/* Navigace týdnů */}
        <Group justify="center" gap="xs">
          <Button
            variant="default"
            size="xs"
            onClick={() => setWeekOffset((o) => o - 1)}
          >
            ←
          </Button>
          <Text size="sm" fw={500} w={170} ta="center">
            {fmt(weekStart)} – {fmt(weekEnd)} {weekEnd.getFullYear()}
          </Text>
          <Button
            variant="default"
            size="xs"
            onClick={() => setWeekOffset((o) => o + 1)}
          >
            →
          </Button>
          <Button variant="subtle" size="xs" onClick={() => setWeekOffset(0)}>
            Dnes
          </Button>
        </Group>

        {/* Tabulka */}
        <div className="week-table">
          <CalendarHeader weekStart={weekStart} />
          <div className="week-table__body">
            {/* Časová osa */}
            <div className="week-table__time-axis">
              {HOURS.map((hour) => (
                <div key={hour} className="week-table__hour-label">
                  {hour}:00
                </div>
              ))}
            </div>

            {/* Sloupce dnů */}
            {DAYS.map((_, dayIdx) => {
              const dayAppts = appointments.filter((a) => a.day === dayIdx + 1);
              return (
                <div key={dayIdx} className="week-table__day-col">
                  {/* Půlhodinové droppable sloty */}
                  {HOURS.map((hour) => (
                    <div key={hour} className="week-table__hour-row">
                      <DroppableSlot dayIdx={dayIdx} hour={hour} minute={0} />
                      <DroppableSlot dayIdx={dayIdx} hour={hour} minute={30} />
                    </div>
                  ))}

                  {/* Schůzky */}
                  {dayAppts.map((appt) => {
                    const top =
                      ((timeToMinutes(appt.start) - gridStart) / 60) *
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

        <CalendarLegend />

        {/* DragOverlay — "duch" při přetahování */}
        <DragOverlay>
          {draggingAppt &&
            (() => {
              const colors = ROOM_COLORS[draggingAppt.room] ?? {
                bg: "#e0e0e0",
                text: "#333",
              };
              const roomNumber = draggingAppt.room.match(/\d+/)?.[0] ?? "";
              const height = (draggingAppt.duration / 60) * SLOT_HEIGHT;
              return (
                <Paper
                  shadow="md"
                  radius="sm"
                  className="week-table__drag-overlay"
                  style={{
                    background: colors.bg,
                    color: colors.text,
                    height: height - 2,
                  }}
                >
                  <span>{draggingAppt.patientName}</span>
                  <span className="week-table__drag-overlay-room">
                    {draggingAppt.start} · ord. {roomNumber}
                  </span>
                </Paper>
              );
            })()}
        </DragOverlay>

        {/* Modal — otevřená schůzka */}
        <AppointmentModal
          appt={selectedAppt}
          onClose={() => setSelectedAppt(null)}
        />
      </Stack>
    </DndContext>
  );
};
