import { DataTable, DataTableColumn } from "../DataTable.tsx";
import { Office } from "@clinio/api";
import { memo, useMemo } from "react";
import { ParseKeys } from "i18next";
import { useGetOfficesQuery } from "../../api/officeService.ts";
import { Grid, Stack, Text } from "@mantine/core";
import { ManageOfficeModalOpenBtn } from "./ManageOfficeModal/ManageOfficeModalOpenBtn.tsx";
import { useT } from "../../hooks/useT";

type OfficeHoursInterval = { from: number; to: number };
type OfficeHoursTemplate = Record<string, OfficeHoursInterval[]>;

type SchemaColumn<T> = Omit<DataTableColumn<T>, "header"> & {
  header: ParseKeys;
};

const DAYS_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const TOP_ALIGN_LEFT: React.CSSProperties = {
  verticalAlign: "top",
  textAlign: "left",
};

const cellPlainText = (text: string) => (
  <Text span size="sm">
    {text}
  </Text>
);

const cellOfficeHours = (
  template: Office["officeHoursTemplate"],
  t: (key: string) => string
) => {
  if (!template || typeof template !== "object") return null;
  const validTemplate = template as unknown as OfficeHoursTemplate;

  return (
    <Stack gap={2} align="center">
      {DAYS_ORDER.map((day) => {
        const intervals = validTemplate[day];
        if (!intervals) return null;

        const timeString = intervals
          .filter(
            (interval): interval is OfficeHoursInterval =>
              !!interval &&
              typeof interval === "object" &&
              "from" in interval &&
              "to" in interval
          )
          .map((slot) => `${slot.from}:00–${slot.to}:00`)
          .join(", ");

        if (!timeString) return null;

        return (
          <Grid key={day} gutter="xs" style={{ width: "100%" }}>
            <Grid.Col span={2}>
              <Text fw={800} size="sm" c="dimmed" ta="left">
                {t(`common.time.daysShort.${day}`)}:
              </Text>
            </Grid.Col>
            <Grid.Col span={8}>{cellPlainText(timeString)}</Grid.Col>
          </Grid>
        );
      })}
    </Stack>
  );
};

const SCHEMA_COLUMNS: SchemaColumn<Office>[] = [
  {
    key: "action",
    header: "office.overview.officesListHeader.action",
    style: TOP_ALIGN_LEFT,
  },
  {
    key: "name",
    header: "office.overview.officesListHeader.name",
    style: TOP_ALIGN_LEFT,
  },
  {
    key: "specialization",
    header: "office.overview.officesListHeader.specialization",
    style: TOP_ALIGN_LEFT,
  },
  {
    key: "address",
    header: "office.overview.officesListHeader.address",
    style: TOP_ALIGN_LEFT,
  },
  {
    key: "officeHours",
    header: "office.overview.officesListHeader.officeHours",
  },
];

function OfficesOverviewOfficesTableComponent() {
  const t = useT();
  const {
    data: offices = [],
    isLoading,
    isError,
    error,
  } = useGetOfficesQuery();

  const columns = useMemo(() => {
    return SCHEMA_COLUMNS.map((col) => ({
      ...col,
      header: t(col.header),
      ...(col.key === "action" && {
        render: ({ id }: Office) => <ManageOfficeModalOpenBtn officeId={id} />,
      }),
      ...(col.key === "officeHours" && {
        render: (row: Office) => cellOfficeHours(row.officeHoursTemplate, t),
      }),
    }));
  }, [t]);

  return (
    <DataTable<Office>
      data={offices}
      keyExtractor={(row) => row.id}
      isLoading={isLoading}
      isError={isError}
      error={error}
      columns={columns}
      highlightOnHover={false}
    />
  );
}

export const OfficesOverviewOfficesTable = memo(
  OfficesOverviewOfficesTableComponent
);
