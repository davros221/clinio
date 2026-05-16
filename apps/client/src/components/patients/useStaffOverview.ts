import { tableOptions } from "../DataTable/tableOptions.ts";
import { usePagination, useT } from "@hooks";
import { useGetUsersQuery } from "@api";
import { UserRole } from "@clinio/shared";

export const useStaffOverview = () => {
  const t = useT();
  const { setPage, page, pageSize } = usePagination();

  const { data, isLoading, isFetching, isError, error } = useGetUsersQuery({
    roles: [UserRole.DOCTOR, UserRole.NURSE],
    page,
    limit: pageSize,
  });

  const staffOverviewTableOptions = tableOptions({
    data: data?.items ?? [],
    keyExtractor: (row) => row.id,
    isLoading,
    isFetching,
    isError,
    error,
    pagination: {
      current: page,
      total: data?.totalPages ?? 0,
      onChange: setPage,
    },
    columns: [
      {
        key: "firstName",
        header: t("patient.form.firstName"),
        render: (row) => row.firstName,
      },
      {
        key: "lastName",
        header: t("patient.form.lastName"),
        render: (row) => row.lastName,
      },
      {
        key: "email",
        header: t("patient.form.email"),
        render: (row) => row.email,
      },
      {
        key: "role",
        header: t("office.form.fields.role"),
        render: (row) =>
          t(`user.roles.${row.role.toLowerCase() as Lowercase<UserRole>}`),
      },
    ],
    highlightOnHover: false,
  });

  return { staffOverviewTableOptions };
};
