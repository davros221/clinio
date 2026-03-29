import { Tooltip } from "@mantine/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Appointment, ROOM_COLORS } from "../utils/types";

type Props = {
  appt: Appointment;
  top: number;
  height: number;
  onClick: () => void;
};

export const AppointmentCard = ({ appt, top, height, onClick }: Props) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: appt.id,
      data: { appt },
    });

  // TODO předelat pak podle vytvareni ordinací
  const colors = ROOM_COLORS[appt.room] ?? {
    bg: "var(--mantine-color-gray-5)",
    text: "var(--mantine-color-white)",
  };

  return (
    <Tooltip
      label={`${appt.patientName} · ${appt.start} · ${appt.room} · ${appt.duration} min`}
      position="top"
      withArrow
      openDelay={400}
    >
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`week-table__appt ${
          isDragging ? "week-table__appt--dragging" : "week-table__appt--idle"
        }`}
        style={
          {
            "--appt-top": `${top}px`,
            "--appt-height": `${height - 2}px`,
            "--appt-bg": colors.bg,
            "--appt-color": colors.text,
            transform: CSS.Translate.toString(transform),
          } as React.CSSProperties
        }
        onClick={onClick}
      >
        <span>{appt.patientName}</span>
        <span className="week-table__appt-room">
          {appt.start} · ord. {appt.roomNumber}
        </span>
      </div>
    </Tooltip>
  );
};
