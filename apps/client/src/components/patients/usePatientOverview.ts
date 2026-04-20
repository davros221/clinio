import { tableOptions } from "../DataTable/tableOptions.ts";
import { ROUTER_PATHS } from "@router";
import { format } from "date-fns";
import { usePagination, useT } from "@hooks";
import { useGetPatientList } from "@api";
import { useNavigate } from "react-router";

export const usePatientOverview = () => {
  const t = useT();
  const { setPage, page, pageSize } = usePagination({ pageSize: 10, page: 1 });

  const { data, isLoading, isFetching, isError, error } = useGetPatientList({
    page,
    limit: pageSize,
  });

  const navigate = useNavigate();

  const patientOverviewTableOptions = tableOptions({
    data: data?.items || [],
    keyExtractor: (row) => row.id,
    isLoading,
    isError,
    error,
    isFetching,
    pagination: {
      current: page,
      total: data?.totalPages ?? 0,
      onChange: setPage,
    },
    actions: [
      {
        label: "Detail",
        onClick: (row) => {
          navigate(ROUTER_PATHS.PATIENT_DETAIL_ID(row.id));
        },
      },
    ],
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
        key: "birthDate",
        header: t("patient.form.birthdate"),
        render: (row) => format(row.birthdate, "dd.MM.yyyy"),
      },
    ],
    highlightOnHover: false,
  });

  return {
    patientOverviewTableOptions,
  };
};
