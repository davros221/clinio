import { Title, Stack, Text } from "@mantine/core";
import { Office } from "@clinio/api";
import { OfficeHoursTemplate } from "@clinio/shared";
import { useGetOfficesQuery } from "../../api/officeApi";
import {
  DataTable,
  DataTableColumn,
  DataTableAction,
} from "../../components/DataTable";
import { useT } from "../../hooks/useT";

type TFunction = ReturnType<typeof useT>;

function formatOfficeHours(
  template: OfficeHoursTemplate | null | undefined,
  t: TFunction
): string {
  if (!template) return "—";
  const days = Object.keys(template) as Array<keyof OfficeHoursTemplate>;
  return days
    .filter((day) => template[day]?.length > 0)
    .map((day) => {
      const slots = template[day]
        .map((s) => `${s.from}:00–${s.to}:00`)
        .join(", ");
      return `${t(`offices.days.${day}`)} ${slots}`;
    })
    .join(" | ");
}

export const OfficeListPage = () => {
  const t = useT();

  const { data, isLoading, isError } = useGetOfficesQuery();

  const columns: DataTableColumn<Office>[] = [
    { key: "name", header: t("offices.columns.name") },
    { key: "specialization", header: t("offices.columns.specialization") },
    { key: "address", header: t("offices.columns.address") },
    {
      key: "officeHoursTemplate",
      header: t("offices.columns.officeHoursTemplate"),
      render: (office) => (
        <Text size="xs">
          {formatOfficeHours(
            office.officeHoursTemplate as OfficeHoursTemplate | null,
            t
          )}
        </Text>
      ),
    },
  ];

  const actions: DataTableAction<Office>[] = [
    {
      label: t("offices.actions.detail"),
      onClick: (office) => console.log("Detail ordinace:", office.id), // TODO: navigate na detail
    },
  ];

  return (
    <Stack>
      <Title>{t("offices.title")}</Title>
      <DataTable
        data={data ?? []}
        columns={columns}
        keyExtractor={(o) => o.id}
        actions={actions}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={t("offices.emptyMessage")}
      />
    </Stack>
  );
};
