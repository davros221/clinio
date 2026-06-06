import { Button, Text, Group, Stack, Paper } from "@mantine/core";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { CalendarDay } from "@clinio/api";
import { AppointmentCard } from "./AppointmentCard";
import { AppointmentModal } from "./AppointmentModal";
import { CalendarHeader } from "./CalendarHeader";
import { DroppableSlot } from "./DroppableSlot";
import { CalendarSlot, SLOT_HEIGHT } from "../utils/types";
import { useT, useCalendar } from "@hooks";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import s from "./Calendar.module.css";

type Props = {
  calendarDays: CalendarDay[];
  officeName?: string;
  onAppointmentMove?: (id: string, day: number, start: string) => void;
  weekTimestamp?: number;
  onWeekTimestampChange?: (timestamp: number) => void;
};

export const Calendar = ({
  calendarDays,
  officeName = "",
  onAppointmentMove,
  weekTimestamp: weekTimestampProp,
  onWeekTimestampChange,
}: Props) => {
  const t = useT();
  const {
    selectedAppt,
    setSelectedAppt,
    draggingAppt,
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
  } = useCalendar({
    calendarDays,
    weekTimestampProp,
    onWeekTimestampChange,
    onAppointmentMove,
  });

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Stack
        gap="sm"
        className={s.calendar}
        style={
          {
            "--cal-col-width": `calc((100% - 48px) / ${visibleDayIndices.length})`,
          } as React.CSSProperties
        }
      >
        {/* Week Navigation */}
        <Group justify="center" gap="xs" className={s.weekNav}>
          <Button variant="default" size="xs" onClick={goToPrevWeek}>
            <MdKeyboardArrowLeft />
          </Button>
          <Text size="sm" fw={500} w={170} ta="center">
            {formatDateTime(weekStart, { day: "numeric", month: "numeric" })} –{" "}
            {formatDateTime(weekEnd, {
              day: "numeric",
              month: "numeric",
              year: "numeric",
            })}
          </Text>
          <Button variant="default" size="xs" onClick={goToNextWeek}>
            <MdKeyboardArrowRight />
          </Button>
          <Button
            variant="subtle"
            size="xs"
            className={s.todayBtn}
            onClick={goToToday}
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
              <MdKeyboardArrowLeft />
            </Button>
            <Text size="sm" fw={500} w={170} ta="center">
              {getDayName(mobileDayIdx)}
            </Text>
            <Button
              variant="default"
              size="xs"
              disabled={mobileDayIdx === 4}
              onClick={() => setMobileDayIdx((d) => Math.min(4, d + 1))}
            >
              <MdKeyboardArrowRight />
            </Button>
          </Group>
        )}

        {/* Table */}
        <div className={s.table}>
          <CalendarHeader
            weekStart={weekStart}
            visibleDayIndices={visibleDayIndices}
          />

          <div
            className={s.body}
            style={{
              gridTemplateColumns: `48px repeat(${visibleDayIndices.length}, 1fr)`,
            }}
          >
            {/* Time Axis */}
            <div className={s.timeAxis}>
              {displayHours.map((hour) => (
                <div key={hour} className={s.hourLabel}>
                  {hour}:00
                </div>
              ))}
            </div>

            {/* Day columns */}
            {visibleDayIndices.map((dayIdx) => {
              const day = calendarDays.find((d) => d.day === dayIdx);
              return (
                <div key={dayIdx} className={s.dayCol}>
                  {day?.hours.map((slot) => {
                    const isForeignBooked =
                      slot.state === "BOOKED" && !slot.appointment;
                    return (
                      <div key={slot.hour} className={s.hourRow}>
                        <DroppableSlot
                          dayIdx={dayIdx}
                          hour={slot.hour}
                          minute={0}
                          closed={slot.state === "CLOSED"}
                          booked={isForeignBooked}
                        />
                        <DroppableSlot
                          dayIdx={dayIdx}
                          hour={slot.hour}
                          minute={30}
                          closed={slot.state === "CLOSED"}
                          booked={isForeignBooked}
                        />
                      </div>
                    );
                  })}

                  {day?.hours
                    .filter(
                      (slot) => slot.state === "BOOKED" && slot.appointment
                    )
                    .map((slot) => {
                      const appt: CalendarSlot = {
                        id: slot.appointment!.id,
                        patientId: slot.appointment!.patient?.id ?? null,
                        patientName: slot.appointment!.patient
                          ? `${slot.appointment!.patient.firstName} ${
                              slot.appointment!.patient.lastName
                            }`.trim()
                          : "Pacient",
                        room: officeName,
                        start: `${String(slot.hour).padStart(2, "0")}:00`,
                        duration: 60,
                        day: dayIdx + 1,
                        status: slot.appointment!.status,
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
              className={s.dragOverlay}
              style={{
                background: "var(--mantine-color-blue-6)",
                color: "var(--mantine-color-white)",
                height: SLOT_HEIGHT - 2,
              }}
            >
              <span>{draggingAppt.patientName}</span>
              <span className={s.dragOverlayRoom}>
                {draggingAppt.start} · {draggingAppt.room}
              </span>
            </Paper>
          )}
        </DragOverlay>

        <AppointmentModal
          appt={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          weekStart={weekStart}
        />
      </Stack>
    </DndContext>
  );
};
