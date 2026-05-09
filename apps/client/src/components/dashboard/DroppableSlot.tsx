import { useDroppable } from "@dnd-kit/core";

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

  const stateClass = closed
    ? "week-table__half-slot--closed"
    : booked
    ? "week-table__half-slot--booked"
    : isOver
    ? "week-table__half-slot--over"
    : "";

  return (
    <div
      ref={setNodeRef}
      className={[
        "week-table__half-slot",
        minute === 30 ? "week-table__half-slot--bottom" : "",
        stateClass,
      ].join(" ")}
    />
  );
};
