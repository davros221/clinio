import { ActionIcon, Checkbox, NativeSelect, Table } from "@mantine/core";
import { memo, useCallback, useMemo } from "react";
import { useManageOfficeFormContext } from "./ManageOfficeFormContext";

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

export type HourValue = (typeof SELECTABLE_HOURS)[number] | null;
export type IntervalType = { from: HourValue; to: HourValue };

/** Max 2 intervals per day (e.g. morning + afternoon split) */
export const MAX_INTERVALS_PER_DAY = 2;

const DEFAULT_INTERVAL: IntervalType = {
  from: "08:00" as HourValue,
  to: "16:00" as HourValue,
};

interface DayRowProps {
  index: number;
  label: string;
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

export const ManageOfficeModalDayRow = memo(({ index, label }: DayRowProps) => {
  const form = useManageOfficeFormContext();
  const day = form.getValues().days[index];
  const { checked, intervals } = day;

  const hasSecond = intervals.length === 2;

  const from0 = intervals[0].from;
  const to0 = intervals[0].to;
  const from1 = intervals[1]?.from ?? null;
  const to1 = intervals[1]?.to ?? null;

  // Interval 0: from0 < to0 < from1 (if exists)
  const from0Options = useMemo(() => hoursInRange(null, to0), [to0]);
  const to0Options = useMemo(() => hoursInRange(from0, from1), [from0, from1]);

  // Interval 1: to0 < from1 < to1
  const from1Options = useMemo(() => hoursInRange(to0, to1), [to0, to1]);
  const to1Options = useMemo(() => hoursInRange(from1, null), [from1]);

  const handleCheck = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = e.currentTarget.checked;
      form.setFieldValue(`days.${index}.checked`, isChecked);
      form.setFieldValue(
        `days.${index}.intervals`,
        isChecked
          ? [{ ...DEFAULT_INTERVAL }]
          : [{ from: null as HourValue, to: null as HourValue }]
      );
    },
    [form, index]
  );

  const handleAddInterval = useCallback(() => {
    const current = form.getValues().days[index].intervals;
    if (current.length >= MAX_INTERVALS_PER_DAY) return;
    form.insertListItem(`days.${index}.intervals`, {
      from: null as HourValue,
      to: null as HourValue,
    });
  }, [form, index]);

  const handleRemoveInterval = useCallback(() => {
    form.removeListItem(`days.${index}.intervals`, 1);
  }, [form, index]);

  const canAdd = checked && !hasSecond && !!from0 && !!to0;

  // getInputProps in uncontrolled mode returns `defaultValue` — destructure
  // it out and re-assign as `value` since NativeSelect needs controlled
  // behavior (options change dynamically based on sibling values).
  const selectProps = (intervalIdx: number, field: "from" | "to") => {
    const { defaultValue, ...props } = form.getInputProps(
      `days.${index}.intervals.${intervalIdx}.${field}`
    );
    return {
      ...props,
      value: (defaultValue ?? EMPTY_OPTION) as string,
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
        props.onChange(e.currentTarget.value || null),
    };
  };

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
            disabled={!checked}
            {...selectProps(0, "from")}
          />
        </Table.Td>

        <Table.Td>
          <NativeSelect
            data={to0Options}
            disabled={!checked || !from0}
            {...selectProps(0, "to")}
          />
        </Table.Td>

        <Table.Td>
          <ActionIcon
            variant="subtle"
            size="sm"
            disabled={!canAdd}
            onClick={handleAddInterval}
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
              disabled={!checked}
              {...selectProps(1, "from")}
            />
          </Table.Td>

          <Table.Td>
            <NativeSelect
              data={to1Options}
              disabled={!checked || !from1}
              {...selectProps(1, "to")}
            />
          </Table.Td>

          <Table.Td>
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              onClick={handleRemoveInterval}
              aria-label="Remove interval"
            >
              ×
            </ActionIcon>
          </Table.Td>
        </Table.Tr>
      )}
    </>
  );
});
