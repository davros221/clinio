import { User } from "@clinio/api";
import { UserRole } from "@clinio/shared";
import { DataTable } from "../DataTable";
import { useGetUsersQuery } from "../../api/userService";
import { useT } from "../../hooks/useT";
import { useUser } from "../../hooks/useUser";

export function PatientsOverviewTable() {
  const t = useT();
  const currentUser = useUser();
  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useGetUsersQuery(
    isAdmin ? [UserRole.DOCTOR, UserRole.NURSE] : [UserRole.CLIENT]
  );

  const baseColumns = [
    {
      key: "firstName",
      header: t("patient.form.firstName"),
      render: (row: User) => row.firstName,
    },
    {
      key: "lastName",
      header: t("patient.form.lastName"),
      render: (row: User) => row.lastName,
    },
    {
      key: "email",
      header: t("patient.form.email"),
      render: (row: User) => row.email,
    },
  ];

  const adminColumns = [
    ...baseColumns,
    {
      key: "role",
      header: t("user.form.role"),
      render: (row: User) => row.role,
    },
  ];

  return (
    <DataTable<User>
      data={users}
      keyExtractor={(row) => row.id}
      isLoading={isLoading}
      isError={isError}
      error={error}
      columns={isAdmin ? adminColumns : baseColumns}
      highlightOnHover={false}
    />
  );
}
