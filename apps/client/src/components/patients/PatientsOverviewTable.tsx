import { User } from "@clinio/api";
import { UserRole } from "@clinio/shared";
import { useGetUsersQuery } from "@api";
import { useT, useUser } from "@hooks";
import { DataTable } from "../DataTable/DataTable";

const mapColumn = (key: keyof User, headerKey: string) => ({
  key,
  header: headerKey,
  render: (row: User) => row[key],
});

export function PatientsOverviewTable() {
  const t = useT();
  const { user: currentUser } = useUser();
  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useGetUsersQuery(
    isAdmin ? [UserRole.DOCTOR, UserRole.NURSE] : [UserRole.CLIENT]
  );

  const columns = [
    mapColumn("firstName", t("patient.form.firstName")),
    mapColumn("lastName", t("patient.form.lastName")),
    mapColumn("email", t("patient.form.email")),
    ...(isAdmin ? [mapColumn("role", t("user.form.role"))] : []),
  ];

  return (
    <DataTable
      data={users}
      keyExtractor={(row) => row.id}
      isLoading={isLoading}
      isError={isError}
      error={error}
      columns={columns}
      highlightOnHover={false}
    />
  );
}
