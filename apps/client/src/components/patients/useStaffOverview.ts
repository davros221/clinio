import { tableOptions } from "../DataTable/tableOptions.ts";
import { useT } from "@hooks";
import { useGetUsersQuery } from "@api";
import { UserRole } from "@clinio/shared";

export const useStaffOverview = () => {
  const t = useT();

  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useGetUsersQuery([UserRole.DOCTOR, UserRole.NURSE]);

  const staffOverviewTableOptions = tableOptions({
    data,
    keyExtractor: (row) => row.id,
    isLoading,
    isError,
    error,
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
        header: t("office.createOfficeModal.fields.role"),
        render: (row) =>
          t(`user.roles.${row.role.toLowerCase() as Lowercase<UserRole>}`),
      },
    ],
    highlightOnHover: false,
  });

  return { staffOverviewTableOptions };
};
