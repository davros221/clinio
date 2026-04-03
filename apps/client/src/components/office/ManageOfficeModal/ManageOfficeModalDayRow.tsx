import { ActionIcon, Checkbox, NativeSelect, Table } from "@mantine/core";
import { memo, useCallback, useMemo } from "react";
import * as React from "react";

export const SELECTABLE_HOURS = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
] as const;

type HourValue = (typeof SELECTABLE_HOURS)[number] | null;

export type IntervalType = { from: HourValue; to: HourValue };

interface DayRowProps {
  index: number;
  label: string;
  checked: boolean;
  intervals: IntervalType[];
  onCheck: (index: number, checked: boolean) => void;
  onFromChange: (
    dayIndex: number,
    intervalIndex: number,
    val: string | null
  ) => void;
  onToChange: (
    dayIndex: number,
    intervalIndex: number,
    val: string | null
  ) => void;
  onAddInterval: (dayIndex: number) => void;
  onRemoveInterval: (dayIndex: number, intervalIndex: number) => void;
  errors: Array<{ from?: React.ReactNode; to?: React.ReactNode }>;
}

const EMPTY_OPTION = "";

// Returns hours strictly after `after` and strictly before `before`.
// Passing null/undefined means no bound on that side.
function hoursInRange(
  after: HourValue | null | undefined,
  before: HourValue | null | undefined
): string[] {
  const afterIdx = after ? SELECTABLE_HOURS.indexOf(after) : -1;
  const beforeIdx = before
    ? SELECTABLE_HOURS.indexOf(before)
    : SELECTABLE_HOURS.length;
  return [
    EMPTY_OPTION,
    ...(SELECTABLE_HOURS.slice(afterIdx + 1, beforeIdx) as unknown as string[]),
  ];
}

export const ManageOfficeModalDayRow = memo(
  ({
    index,
    label,
    checked,
    intervals,
    onCheck,
    onFromChange,
    onToChange,
    onAddInterval,
    onRemoveInterval,
    errors,
  }: DayRowProps) => {
    const hasSecond = intervals.length === 2;

    const from0 = intervals[0].from;
    const to0 = intervals[0].to;
    const from1 = intervals[1]?.from ?? null;
    const to1 = intervals[1]?.to ?? null;

    // Interval 0: from0 < to0 < from1 (if exists)
    // from1 is null when there's no second interval, so to0Options naturally has no upper bound then
    const from0Options = useMemo(() => hoursInRange(null, to0), [to0]);
    const to0Options = useMemo(
      () => hoursInRange(from0, from1),
      [from0, from1]
    );

    // Interval 1: to0 < from1 < to1
    const from1Options = useMemo(() => hoursInRange(to0, to1), [to0, to1]);
    const to1Options = useMemo(() => hoursInRange(from1, null), [from1]);

    const handleCheck = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onCheck(index, e.currentTarget.checked),
      [onCheck, index]
    );

    const handleFrom0Change = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) =>
        onFromChange(index, 0, e.currentTarget.value || null),
      [onFromChange, index]
    );
    const handleTo0Change = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) =>
        onToChange(index, 0, e.currentTarget.value || null),
      [onToChange, index]
    );
    const handleFrom1Change = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) =>
        onFromChange(index, 1, e.currentTarget.value || null),
      [onFromChange, index]
    );
    const handleTo1Change = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) =>
        onToChange(index, 1, e.currentTarget.value || null),
      [onToChange, index]
    );

    const handleAdd = useCallback(
      () => onAddInterval(index),
      [onAddInterval, index]
    );
    const handleRemove = useCallback(
      () => onRemoveInterval(index, 1),
      [onRemoveInterval, index]
    );

    const canAdd =
      checked && !hasSecond && !!intervals[0].from && !!intervals[0].to;

    return (
      <>
        <Table.Tr style={hasSecond ? { borderBottom: "none" } : undefined}>
          <Table.Td>
            <Checkbox checked={checked} onChange={handleCheck} />
          </Table.Td>

          <Table.Td>{label}</Table.Td>

          <Table.Td>
            <NativeSelect
              data={from0Options}
              value={intervals[0].from ?? EMPTY_OPTION}
              onChange={handleFrom0Change}
              disabled={!checked}
              error={errors[0]?.from}
            />
          </Table.Td>

          <Table.Td>
            <NativeSelect
              data={to0Options}
              value={intervals[0].to ?? EMPTY_OPTION}
              onChange={handleTo0Change}
              disabled={!checked || !intervals[0].from}
              error={errors[0]?.to}
            />
          </Table.Td>

          <Table.Td>
            <ActionIcon
              variant="subtle"
              size="sm"
              disabled={!canAdd}
              onClick={handleAdd}
              aria-label="Add interval"
            >
              +
            </ActionIcon>
          </Table.Td>
        </Table.Tr>

        {hasSecond && (
          <Table.Tr>
            <Table.Td colSpan={2} />

            <Table.Td>
              <NativeSelect
                data={from1Options}
                value={intervals[1].from ?? EMPTY_OPTION}
                onChange={handleFrom1Change}
                disabled={!checked}
                error={errors[1]?.from}
              />
            </Table.Td>

            <Table.Td>
              <NativeSelect
                data={to1Options}
                value={intervals[1].to ?? EMPTY_OPTION}
                onChange={handleTo1Change}
                disabled={!checked || !intervals[1].from}
                error={errors[1]?.to}
              />
            </Table.Td>

            <Table.Td>
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={handleRemove}
                aria-label="Remove interval"
              >
                ×
              </ActionIcon>
            </Table.Td>
          </Table.Tr>
        )}
      </>
    );
  }
);
