import { Text } from "@mantine/core";
import { DAYS, fmt } from "./types";

type Props = {
  weekStart: Date;
};

export const CalendarHeader = ({ weekStart }: Props) => (
  <div className="week-table__header">
    <div className="week-table__header-corner" />
    {DAYS.map((day, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return (
        <div key={day} className="week-table__header-cell">
          <Text size="xs" fw={600} c="#111">
            {day}
          </Text>
          <Text size="xs" c="#111">
            {fmt(d)}
          </Text>
        </div>
      );
    })}
  </div>
);
