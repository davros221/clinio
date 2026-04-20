import { useDroppable } from "@dnd-kit/core";

type Props = {
  dayIdx: number;
  hour: number;
  minute: 0 | 30;
  closed?: boolean;
};

export const DroppableSlot = ({
  dayIdx,
  hour,
  minute,
  closed = false,
}: Props) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${dayIdx}-${hour}-${minute}`,
    disabled: closed,
  });

  return (
    <div
      ref={setNodeRef}
      className={[
        "week-table__half-slot",
        minute === 30 ? "week-table__half-slot--bottom" : "",
        closed
          ? "week-table__half-slot--closed"
          : isOver
          ? "week-table__half-slot--over"
          : "",
      ].join(" ")}
    />
  );
};
