import { Table, Text } from "@mantine/core";
import { DataTableAction, DataTableColumn } from "../DataTableProps.ts";
import { DataTableActions } from "./DataTableActions.tsx";
import { DataTableSkeleton } from "./DataTableSkeleton.tsx";

export type Props<TData> = {
  data?: TData[];
  columns: DataTableColumn<TData>[];
  actions?: DataTableAction<TData>[];
  hasActions: boolean;
  keyExtractor: (row: TData) => string;
  isLoading?: boolean;
  emptyMessage?: string;
};

export const DataTableBody = <TData,>(props: Props<TData>) => {
  const {
    columns,
    emptyMessage,
    isLoading,
    keyExtractor,
    actions,
    data,
    hasActions,
  } = props;

  if (isLoading) {
    return <DataTableSkeleton columns={columns} hasActions={hasActions} />;
  }

  if (!data || data.length === 0) {
    return (
      <Table.Tr>
        <Table.Td colSpan={columns.length + (hasActions ? 1 : 0)}>
          <Text ta={"center"} c={"dimmed"} size={"sm"}>
            {emptyMessage}
          </Text>
        </Table.Td>
      </Table.Tr>
    );
  }

  return data.map((row) => (
    <Table.Tr key={keyExtractor(row)}>
      {columns.map((col) => (
        <Table.Td key={col.key} style={col.style}>
          {col.render(row)}
        </Table.Td>
      ))}
      {hasActions && actions && (
        <DataTableActions row={row} actions={actions} />
      )}
    </Table.Tr>
  ));
};
