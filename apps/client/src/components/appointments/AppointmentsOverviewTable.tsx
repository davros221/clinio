import { Badge } from "@mantine/core";
import { Appointment } from "@clinio/api";
import { DataTable } from "../DataTable/DataTable";
import { useGetOfficeListQuery, useGetAppointmentListQuery } from "@api";
import { AppointmentStatus } from "@clinio/shared";
import { usePagination, useT } from "@hooks";
import { DateUtils } from "@utils";
import { useMemo } from "react";

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PLANNED]: "blue",
  [AppointmentStatus.COMPLETED]: "green",
  [AppointmentStatus.CANCELLED]: "red",
};

type Props = {
  officeId?: string;
};

export function AppointmentsOverviewTable({ officeId }: Props = {}) {
  const t = useT();
  const { page, pageSize, setPage } = usePagination();
  const { data, isLoading, isFetching, isError, error } =
    useGetAppointmentListQuery({
      page,
      limit: pageSize,
      officeId,
    });
  const { data: officesData } = useGetOfficeListQuery();
  const offices = officesData?.items ?? [];

  const appointments = data?.items ?? [];

  const officeMap = useMemo(
    () => Object.fromEntries(offices.map((o) => [o.id, o.name])),
    [offices]
  );

  const columns = [
    {
      key: "date",
      header: t("appointment.overview.table.date"),
      render: (row: Appointment) => DateUtils.formatDate(row.date),
    },
    {
      key: "hour",
      header: t("appointment.overview.table.time"),
      render: (row: Appointment) => `${row.hour}:00`,
    },
    {
      key: "status",
      header: t("appointment.overview.table.status"),
      render: (row: Appointment) => (
        <Badge color={STATUS_COLOR[row.status] ?? "gray"} variant="light">
          {t(
            `appointment.status.${
              row.status.toLowerCase() as Lowercase<AppointmentStatus>
            }`
          )}
        </Badge>
      ),
    },
    {
      key: "officeId",
      header: t("appointment.overview.table.office"),
      render: (row: Appointment) => {
        const id = typeof row.officeId === "string" ? row.officeId : null;
        return id ? officeMap[id] ?? id : "—";
      },
    },
    {
      key: "note",
      header: t("appointment.overview.table.note"),
      render: (row: Appointment) => row.note || "—",
    },
  ];

  return (
    <DataTable<Appointment>
      data={appointments}
      keyExtractor={(row) => row.id}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      error={error}
      columns={columns}
      highlightOnHover={false}
      pagination={{
        current: page,
        total: data?.totalPages ?? 0,
        onChange: setPage,
      }}
    />
  );
}
