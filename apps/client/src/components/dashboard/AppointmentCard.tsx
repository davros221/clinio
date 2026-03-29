import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Appointment, getRoomColor } from "../utils/types";
import { useT } from "../../hooks/useT";

type Props = {
  appt: Appointment;
  top: number;
  height: number;
  onClick: () => void;
};

export const AppointmentCard = ({ appt, top, height, onClick }: Props) => {
  const t = useT();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: appt.id,
      data: { appt },
    });

  const colors = getRoomColor(appt.roomNumber);

  return (
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
        {appt.start} · {t("offices.label")} {appt.roomNumber}
      </span>
    </div>
  );
};
