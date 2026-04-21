import { ActionIcon, Button, Menu, Table } from "@mantine/core";
import { DataTableAction } from "../DataTableProps.ts";
import { MdMoreHoriz } from "react-icons/md";

type Props<TData> = {
  actions: DataTableAction<TData>[];
  row: TData;
  disabled?: boolean;
};

export const DataTableActions = <TData,>(props: Props<TData>) => {
  const { actions, row, disabled } = props;

  const filteredActions = actions.filter((a) => a.visible?.(row) ?? true);

  // All actions hidden for this row — render empty cell to keep header/body aligned
  if (filteredActions.length === 0) return <Table.Td />;
  if (filteredActions.length === 1) {
    const action = filteredActions[0];

    return (
      <Table.Td w={60}>
        <Button
          size={"xs"}
          variant={action.variant ?? "default"}
          color={action.color}
          disabled={(disabled || action.disabled?.(row)) ?? false}
          onClick={() => action.onClick(row)}
        >
          {action.label}
        </Button>
      </Table.Td>
    );
  }

  // Mantine menu component doesn't support anchor target, so we need to render menu for each table element :(
  return (
    <Table.Td w={20} align={"center"}>
      <Menu>
        <Menu.Target>
          <ActionIcon disabled={disabled}>
            <MdMoreHoriz />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          {filteredActions.map((action) => (
            <Menu.Item
              key={action.label}
              onClick={() => action.onClick(row)}
              variant={action.variant}
              color={action.color}
              disabled={action.disabled?.(row) ?? false}
            >
              {action.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </Table.Td>
  );
};
