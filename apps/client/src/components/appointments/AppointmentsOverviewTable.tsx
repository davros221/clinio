import { Badge } from "@mantine/core";
import { Appointment } from "@clinio/api";
import { DataTable } from "../DataTable/DataTable";
import { useGetOfficeListQuery, useGetAppointmentListQuery } from "@api";
import { AppointmentStatus } from "@clinio/shared";
import { useT } from "@hooks";
import { DateUtils } from "@utils";

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PLANNED]: "blue",
  [AppointmentStatus.COMPLETED]: "green",
  [AppointmentStatus.CANCELLED]: "red",
};

export function AppointmentsOverviewTable() {
  const t = useT();
  const {
    data: appointments = [],
    isLoading,
    isError,
    error,
  } = useGetAppointmentListQuery();
  const { data: offices = [] } = useGetOfficeListQuery();

  const officeMap = Object.fromEntries(offices.map((o) => [o.id, o.name]));

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
      isError={isError}
      error={error}
      columns={columns}
      highlightOnHover={false}
    />
  );
}
