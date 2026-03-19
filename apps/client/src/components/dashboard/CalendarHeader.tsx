import { Text } from "@mantine/core";
import { useMemo } from "react";
import { getWeekDay, fmt } from "../utils/dateUtils";
import { DAYS } from "../utils/types";

type Props = {
  weekStart: Date;
  visibleDayIndices: number[];
};

export const CalendarHeader = ({
  weekStart,
  visibleDayIndices = [0, 1, 2, 3, 4],
}: Props) => {
  // Memo -> it is only recalculated when the week or visible days change
  const days = useMemo(
    () =>
      visibleDayIndices.map((dayIdx) => ({
        dayIdx,
        name: DAYS[dayIdx],
        date: getWeekDay(weekStart, dayIdx),
      })),
    [weekStart, visibleDayIndices]
  );

  return (
    <div
      className="week-table__header"
      style={{
        gridTemplateColumns: `48px repeat(${visibleDayIndices.length}, 1fr)`,
      }}
    >
      <div className="week-table__header-corner" />
      {days.map(({ dayIdx, name, date }) => (
        <div key={dayIdx} className="week-table__header-cell">
          <Text size="xs" fw={600}>
            {name}
          </Text>
          <Text size="xs">{fmt(date)}</Text>
        </div>
      ))}
    </div>
  );
};
