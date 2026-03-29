import { Table, Loader, Alert, Button, Group, Text, Box } from "@mantine/core";
import { MdErrorOutline } from "react-icons/md";
import { ApiError } from "@clinio/shared";
import { useT } from "@hooks";
import classes from "./DataTable.module.css";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  style?: React.CSSProperties;
};

export type DataTableAction<T> = {
  label: string;
  onClick: (row: T) => void;
  variant?: "default" | "filled" | "light" | "subtle" | "outline";
  color?: string;
  visible?: (row: T) => boolean;
};

type Props<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (row: T) => string;
  actions?: DataTableAction<T>[];
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: unknown;
  emptyMessage?: string;
  highlightOnHover?: boolean;
};

/**
 * Generic data table component built on top of Mantine Table.
 * Supports loading/error states, empty message, row actions, and custom column renderers.
 */
export const DataTable = <T,>({
  data,
  columns,
  keyExtractor,
  actions,
  isLoading,
  isFetching,
  isError,
  error,
  emptyMessage,
  highlightOnHover = true,
}: Props<T>) => {
  const t = useT();
  const resolvedEmptyMessage =
    emptyMessage ?? t("component.dataTable.emptyText");

  if (isLoading)
    return (
      <Box className={classes.loader}>
        <Loader />
      </Box>
    );

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

  const hasActions = actions && actions.length > 0;

  return (
    <Box className={classes.scrollContainer}>
      <Box className={classes.wrapper}>
        <Table
          striped
          highlightOnHover={highlightOnHover}
          withColumnBorders
          classNames={{
            table: classes.table,
            thead: classes.thead,
            th: classes.th,
            td: classes.td,
          }}
        >
          <Table.Thead>
            <Table.Tr>
              {hasActions && (
                <Table.Th>{t("component.dataTable.actionsColumn")}</Table.Th>
              )}
              {columns.map((col) => (
                <Table.Th key={col.key}>{col.header}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {data.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length + (hasActions ? 1 : 0)}>
                  <Text
                    ta="center"
                    c="dimmed"
                    size="sm"
                    className={classes.emptyRow}
                  >
                    {resolvedEmptyMessage}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              data.map((row) => (
                <Table.Tr key={keyExtractor(row)}>
                  {hasActions && (
                    <Table.Td>
                      <Group gap="xs">
                        {actions
                          .filter((action) => action.visible?.(row) ?? true)
                          .map((action) => (
                            <Button
                              key={action.label}
                              size="xs"
                              variant={action.variant ?? "default"}
                              color={action.color}
                              onClick={() => action.onClick(row)}
                            >
                              {action.label}
                            </Button>
                          ))}
                      </Group>
                    </Table.Td>
                  )}

                  {columns.map((col) => (
                    <Table.Td key={col.key} style={col.style}>
                      {col.render
                        ? col.render(row)
                        : String(
                            (row as Record<string, unknown>)[col.key] ?? ""
                          )}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Box>
    </Box>
  );
};
