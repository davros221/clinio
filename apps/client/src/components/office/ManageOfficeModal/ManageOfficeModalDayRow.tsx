import { Checkbox, NativeSelect, Table } from "@mantine/core";
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

interface DayRowProps {
  index: number;
  label: string;
  checked: boolean;
  fromValue: HourValue;
  toValue: HourValue;
  onCheck: (index: number, checked: boolean) => void;
  onFromChange: (index: number, val: string | null) => void;
  onToChange: (index: number, val: string | null) => void;
  errorFrom?: React.ReactNode;
  errorTo?: React.ReactNode;
}

const EMPTY_OPTION = "";

export const ManageOfficeModalDayRow = memo(
  ({
    index,
    label,
    checked,
    fromValue,
    toValue,
    onCheck,
    onFromChange,
    onToChange,
    errorFrom,
    errorTo,
  }: DayRowProps) => {
    const fromData = useMemo(() => {
      const hours = toValue
        ? (SELECTABLE_HOURS.slice(
            0,
            SELECTABLE_HOURS.indexOf(toValue)
          ) as unknown as string[])
        : (SELECTABLE_HOURS as unknown as string[]);
      return [EMPTY_OPTION, ...hours];
    }, [toValue]);

    const toData = useMemo(() => {
      const hours = fromValue
        ? (SELECTABLE_HOURS.slice(
            SELECTABLE_HOURS.indexOf(fromValue) + 1
          ) as unknown as string[])
        : (SELECTABLE_HOURS as unknown as string[]);
      return [EMPTY_OPTION, ...hours];
    }, [fromValue]);

    const handleCheck = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onCheck(index, e.currentTarget.checked),
      [onCheck, index]
    );

    const handleFromChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) =>
        onFromChange(index, e.currentTarget.value || null),
      [onFromChange, index]
    );

    const handleToChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) =>
        onToChange(index, e.currentTarget.value || null),
      [onToChange, index]
    );

    return (
      <Table.Tr>
        <Table.Td>
          <Checkbox checked={checked} onChange={handleCheck} />
        </Table.Td>

        <Table.Td>{label}</Table.Td>

        <Table.Td>
          <NativeSelect
            data={fromData}
            value={fromValue ?? EMPTY_OPTION}
            onChange={handleFromChange}
            disabled={!checked}
            error={errorFrom}
          />
        </Table.Td>

        <Table.Td>
          <NativeSelect
            data={toData}
            value={toValue ?? EMPTY_OPTION}
            onChange={handleToChange}
            disabled={!checked || !fromValue}
            error={errorTo}
          />
        </Table.Td>
      </Table.Tr>
    );
  }
);
