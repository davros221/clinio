import {
  Button,
  Group,
  Paper,
  Select,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useMemo } from "react";
import { useT } from "@hooks";
import { User } from "@clinio/api";

type Props = {
  editing: boolean;
  users: User[];
  selectedRole: string | null;
  selectedUserId: string | null;
  roleSelectData: Array<{ value: string; label: string }>;
  userSelectData: Array<{ value: string; label: string }>;
  onRoleChange: (role: string | null) => void;
  onUserChange: (userId: string | null) => void;
  onAddStaff: () => void;
  onRemoveStaff: (index: number) => void;
  staffIds: string[];
};

export function OfficeDetailPersonnel({
  editing,
  users,
  selectedRole,
  selectedUserId,
  roleSelectData,
  userSelectData,
  onRoleChange,
  onUserChange,
  onAddStaff,
  onRemoveStaff,
  staffIds,
}: Props) {
  const t = useT();

  const staffMembers = useMemo(() => {
    const usersById = new Map(users.map((u) => [u.id, u]));
    return staffIds
      .map((id) => usersById.get(id))
      .filter((u): u is User => !!u);
  }, [staffIds, users]);

  return (
    <Paper
      p="lg"
      radius="md"
      shadow="sm"
      withBorder
      style={{ flex: "1 1 400px" }}
    >
      <Title order={4} mb="xs">
        {t("office.form.sections.personnel")}
      </Title>

      {editing && (
        <Group grow align="flex-end" mb="md" wrap="wrap">
          <Select
            label={t("office.form.fields.role")}
            placeholder={t("office.form.fields.rolePlaceholder")}
            data={roleSelectData}
            value={selectedRole}
            onChange={onRoleChange}
            clearable
          />
          <Select
            label={t("office.form.fields.user")}
            placeholder={t("office.form.fields.userPlaceholder")}
            data={userSelectData}
            value={selectedUserId}
            onChange={onUserChange}
            searchable
            disabled={!selectedRole}
          />
          <Button
            variant="filled"
            color="gray"
            disabled={!selectedUserId}
            onClick={onAddStaff}
          >
            {t("office.form.table.add")}
          </Button>
        </Group>
      )}

      {editing ? (
        <Table verticalSpacing="xs">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("office.form.fields.user")}</Table.Th>
              <Table.Th>{t("office.form.table.role")}</Table.Th>
              <Table.Th>{t("office.form.table.actions")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {staffIds.map((staffId, index) => {
              const member = users.find((u) => u.id === staffId);
              if (!member) return null;
              return (
                <Table.Tr key={staffId}>
                  <Table.Td>
                    {member.firstName} {member.lastName}
                  </Table.Td>
                  <Table.Td>{member.role}</Table.Td>
                  <Table.Td>
                    <Button
                      variant="subtle"
                      color="red"
                      size="xs"
                      onClick={() => onRemoveStaff(index)}
                    >
                      {t("office.form.table.remove")}
                    </Button>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      ) : staffMembers.length > 0 ? (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("office.form.fields.user")}</Table.Th>
              <Table.Th>{t("office.form.table.role")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {staffMembers.map((member) => (
              <Table.Tr key={member.id}>
                <Table.Td>
                  {member.firstName} {member.lastName}
                </Table.Td>
                <Table.Td>{member.role}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Text c="dimmed" size="sm">
          {t("office.form.noPersonnel")}
        </Text>
      )}
    </Paper>
  );
}
