import { Tooltip } from "@mantine/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Appointment, ROOM_COLORS } from "./types";

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

  const colors = ROOM_COLORS[appt.room] ?? { bg: "#e0e0e0", text: "#333" };
  const roomNumber = appt.room.match(/\d+/)?.[0] ?? "";

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
        className="week-table__appt"
        style={{
          top,
          height: height - 2,
          background: colors.bg,
          color: colors.text,
          opacity: isDragging ? 0.3 : 1,
          transform: CSS.Translate.toString(transform),
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onClick={onClick}
      >
        <span>{appt.patientName}</span>
        <span className="week-table__appt-room">
          {appt.start} · ord. {roomNumber}
        </span>
      </div>
    </Tooltip>
  );
};
