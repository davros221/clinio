import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import s from "./DroppableSlot.module.css";

type Props = {
  dayIdx: number;
  hour: number;
  minute: 0 | 30;
  closed?: boolean;
  booked?: boolean;
};

export const DroppableSlot = ({
  dayIdx,
  hour,
  minute,
  closed = false,
  booked = false,
}: Props) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${dayIdx}-${hour}-${minute}`,
    disabled: closed || booked,
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        s.slot,
        minute === 30 && s.bottom,
        closed && s.closed,
        booked && s.booked,
        isOver && s.over
      )}
    />
  );
};
