import { Skeleton, Table } from "@mantine/core";
import { DataTableColumn } from "../DataTableProps.ts";

type Props<TData> = {
  columns: DataTableColumn<TData>[];
  hasActions: boolean;
};

export const DataTableSkeleton = <TData,>(props: Props<TData>) => {
  const { columns, hasActions } = props;
  return Array.from({ length: 10 }).map((_, i) => (
    <Table.Tr key={i}>
      {columns.map((col) => (
        <Table.Td key={col.key} style={col.style}>
          <Skeleton width={"100%"} height={12} />
        </Table.Td>
      ))}
      {hasActions && <Table.Td />}
    </Table.Tr>
  ));
};
