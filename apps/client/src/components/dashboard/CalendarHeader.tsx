import { Text } from "@mantine/core";
import { useMemo } from "react";
import clsx from "clsx";
import { DateUtils } from "@utils";
import { useIntl } from "@hooks";
import s from "./CalendarHeader.module.css";

type Props = {
  weekStart: Date;
  visibleDayIndices: number[];
};

export const CalendarHeader = ({
  weekStart,
  visibleDayIndices = [0, 1, 2, 3, 4],
}: Props) => {
  const { getDayName, formatDateTime } = useIntl();

  const todayIso = DateUtils.toIsoDate(new Date());

  const days = useMemo(
    () =>
      visibleDayIndices.map((dayIdx) => {
        const date = DateUtils.getWeekDay(weekStart, dayIdx);
        return {
          dayIdx,
          name: getDayName(dayIdx),
          date,
          isToday: DateUtils.toIsoDate(date) === todayIso,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekStart, visibleDayIndices, getDayName]
  );

  return (
    <div
      className={s.header}
      style={{
        gridTemplateColumns: `48px repeat(${visibleDayIndices.length}, 1fr)`,
      }}
    >
      <div className={s.corner} />
      {days.map(({ dayIdx, name, date, isToday }) => (
        <div key={dayIdx} className={clsx(s.cell, isToday && s.cellToday)}>
          <Text size="xs" fw={600} c={isToday ? "blue.7" : "dark.9"}>
            {name}
          </Text>
          <Text size="xs" c={isToday ? "blue.7" : "dark.9"}>
            {formatDateTime(date, { day: "numeric", month: "numeric" })}
          </Text>
        </div>
      ))}
    </div>
  );
};
