import { ActionIcon, Checkbox, NativeSelect, Table } from "@mantine/core";
import { memo, useCallback, useMemo, useReducer } from "react";
import {
  useManageOfficeFormContext,
  DEFAULT_INTERVAL,
  MAX_INTERVALS_PER_DAY,
  formatHour,
} from "./ManageOfficeFormContext";

/** All selectable hours as integers 0–23 */
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const EMPTY_VALUE = "";

/** Build NativeSelect options for hours in range (after, before), exclusive. */
function hourOptions(
  after: number | null | undefined,
  before: number | null | undefined
): Array<{ value: string; label: string }> {
  const start = after != null ? after + 1 : 0;
  const end = before != null ? before : 24;
  return [
    { value: EMPTY_VALUE, label: "" },
    ...HOURS.filter((h) => h >= start && h < end).map((h) => ({
      value: String(h),
      label: formatHour(h),
    })),
  ];
}

interface DayRowProps {
  index: number;
  label: string;
}

export const ManageOfficeFormDayRow = memo(({ index, label }: DayRowProps) => {
  const form = useManageOfficeFormContext();
  // Uncontrolled mode doesn't trigger re-renders on value changes.
  // We need re-renders to recompute dependent options (e.g. "to" depends on "from"),
  // so we force one after every local mutation.
  const [, rerender] = useReducer((c: number) => c + 1, 0);
  const day = form.getValues().days[index];
  const { checked, intervals } = day;

  const hasSecond = intervals.length === 2;

  const from0 = intervals[0].from;
  const to0 = intervals[0].to;
  const from1 = intervals[1]?.from ?? null;
  const to1 = intervals[1]?.to ?? null;

  // Interval 0: from0 < to0 < from1 (if exists)
  const from0Options = useMemo(() => hourOptions(null, to0), [to0]);
  const to0Options = useMemo(() => hourOptions(from0, from1), [from0, from1]);

  // Interval 1: to0 < from1 < to1
  const from1Options = useMemo(() => hourOptions(to0, to1), [to0, to1]);
  const to1Options = useMemo(() => hourOptions(from1, null), [from1]);

  const handleCheck = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = e.currentTarget.checked;
      form.setFieldValue(`days.${index}.checked`, isChecked);
      form.setFieldValue(
        `days.${index}.intervals`,
        isChecked ? [{ ...DEFAULT_INTERVAL }] : [{ from: null, to: null }]
      );
      rerender();
    },
    [form, index, rerender]
  );

  const handleAddInterval = useCallback(() => {
    const current = form.getValues().days[index].intervals;
    if (current.length >= MAX_INTERVALS_PER_DAY) return;
    form.insertListItem(`days.${index}.intervals`, {
      from: null,
      to: null,
    });
    rerender();
  }, [form, index, rerender]);

  const handleRemoveInterval = useCallback(() => {
    form.removeListItem(`days.${index}.intervals`, 1);
    rerender();
  }, [form, index, rerender]);

  const canAdd = checked && !hasSecond && from0 != null && to0 != null;

  // getInputProps in uncontrolled mode returns `defaultValue` — destructure
  // it out and re-assign as `value` since NativeSelect needs controlled
  // behavior (options change dynamically based on sibling values).
  // Values are stored as numbers, NativeSelect uses strings.
  const selectProps = (intervalIdx: number, field: "from" | "to") => {
    const { defaultValue, ...props } = form.getInputProps(
      `days.${index}.intervals.${intervalIdx}.${field}`
    );
    return {
      ...props,
      value: defaultValue != null ? String(defaultValue) : EMPTY_VALUE,
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
        const v = e.currentTarget.value;
        props.onChange(v === "" ? null : Number(v));
        rerender();
      },
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
            disabled={!checked || from0 == null}
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
              disabled={!checked || from1 == null}
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
