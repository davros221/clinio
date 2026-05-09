import { Tooltip } from "@mantine/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CalendarSlot } from "../utils/types";
import { APPOINTMENT_STATUS_STYLE } from "@utils";

type Props = {
  appt: CalendarSlot;
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

  const { bg, color, border } = APPOINTMENT_STATUS_STYLE[appt.status];

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
            "--appt-bg": bg,
            "--appt-color": color,
            "--appt-border": border,
            transform: CSS.Translate.toString(transform),
          } as React.CSSProperties
        }
        onClick={onClick}
      >
        <span>{appt.patientName}</span>
        <span className="week-table__appt-room">
          {appt.start} · {appt.room}
        </span>
      </div>
    </Tooltip>
  );
};
