import { useDroppable } from "@dnd-kit/core";

type Props = {
  dayIdx: number;
  hour: number;
  minute: 0 | 30;
};

export const DroppableSlot = ({ dayIdx, hour, minute }: Props) => {
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
