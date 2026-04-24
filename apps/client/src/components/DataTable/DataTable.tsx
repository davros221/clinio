import {
  Table,
  Box,
  Alert,
  LoadingOverlay,
  Pagination,
  Center,
  Paper,
} from "@mantine/core";
import { useT } from "@hooks";
import classes from "./DataTable.module.css";
import {
  DataTableAction,
  DataTableColumn,
  DataTableRowClick,
} from "./DataTableProps.ts";
import { DataTableBody } from "./components/DataTableBody.tsx";
import { MdErrorOutline } from "react-icons/md";
import { ApiError } from "@clinio/shared";

export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (row: T) => string;
  actions?: DataTableAction<T>[];
  onRowClick?: DataTableRowClick<T>;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: unknown;
  emptyMessage?: string;
  highlightOnHover?: boolean;
  pagination?: {
    total: number;
    current: number;
    onChange: (page: number) => void;
  };
};

/**
 * Generic data table component built on top of Mantine Table.
 * Supports loading/error states, empty message, row actions, and custom column renderers.
 */
export const DataTable = <T,>(props: DataTableProps<T>) => {
  const {
    data,
    columns,
    keyExtractor,
    actions,
    onRowClick,
    isLoading,
    isFetching,
    isError,
    error,
    pagination,
    emptyMessage,
    highlightOnHover = true,
  } = props;

  const t = useT();
  const resolvedEmptyMessage =
    emptyMessage ?? t("component.dataTable.emptyText");

  if (isError) {
    const isApiError = (e: unknown): e is ApiError =>
      typeof e === "object" && e !== null && "errorCode" in e && "message" in e;

    const errorMessage = isApiError(error)
      ? error.message
      : t("component.dataTable.errorFallback");

    return (
      <Alert icon={<MdErrorOutline size={16} />} color="red">
        {errorMessage}
      </Alert>
    );
  }

  const hasActions = !!actions?.length;

  return (
    <Paper radius="md" shadow="sm" withBorder className={classes.paper}>
      <Box className={classes.scrollContainer}>
        <Box className={classes.wrapper}>
          <Table
            highlightOnHover={highlightOnHover}
            classNames={{
              table: classes.table,
              thead: classes.thead,
              th: classes.th,
              td: classes.td,
            }}
          >
            <Table.Thead>
              <Table.Tr>
                {columns.map((col) => (
                  <Table.Th key={col.key}>{col.header}</Table.Th>
                ))}
                {hasActions && (
                  <Table.Th>{t("component.dataTable.actionsColumn")}</Table.Th>
                )}
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              <DataTableBody
                hasActions={hasActions}
                keyExtractor={keyExtractor}
                data={data}
                columns={columns}
                emptyMessage={resolvedEmptyMessage}
                isLoading={isLoading}
                actions={actions}
                onRowClick={onRowClick}
              />
            </Table.Tbody>
          </Table>
        </Box>
        <LoadingOverlay visible={isFetching} />
      </Box>
      {pagination && pagination.total > 1 && (
        <Center py="md">
          <Pagination
            total={pagination.total}
            value={pagination.current}
            onChange={pagination.onChange}
            disabled={isFetching}
          />
        </Center>
      )}
    </Paper>
  );
};
