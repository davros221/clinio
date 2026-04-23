import { Paper, Table, Title } from "@mantine/core";
import { useT } from "@hooks";
import { useManageOfficeFormContext } from "../../../components/office/ManageOfficeForm/ManageOfficeFormContext";
import { ManageOfficeFormDayRow } from "../../../components/office/ManageOfficeForm/ManageOfficeFormDayRow.tsx";
import { DAYS } from "@clinio/shared";
import { OfficeHoursTemplateDto } from "@clinio/api";
import { ParseKeys } from "i18next";

type Props = {
  template: OfficeHoursTemplateDto | null;
  editing: boolean;
};

export function OfficeDetailHours({ template, editing }: Props) {
  const t = useT();
  const form = useManageOfficeFormContext();

  return (
    <Paper
      p="lg"
      radius="md"
      shadow="sm"
      withBorder
      style={{ flex: "1 1 400px" }}
    >
      <Title order={4} mb="xs">
        {t("office.form.sections.hours")}
      </Title>
      {editing ? (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("office.form.table.open")}</Table.Th>
              <Table.Th>{t("office.form.table.day")}</Table.Th>
              <Table.Th>{t("office.form.table.from")}</Table.Th>
              <Table.Th>{t("office.form.table.to")}</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {form.getValues().days.map((day, index) => (
              <ManageOfficeFormDayRow
                key={day.key}
                index={index}
                label={t(`common.time.daysShort.${day.key}` as ParseKeys)}
              />
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("office.form.table.day")}</Table.Th>
              <Table.Th>{t("office.form.table.from")}</Table.Th>
              <Table.Th>{t("office.form.table.to")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {DAYS.map((day) => {
              const intervals = template?.[day];
              if (!intervals?.length) return null;
              return intervals.map((slot, i) => (
                <Table.Tr key={`${day}-${i}`}>
                  {i === 0 && (
                    <Table.Td rowSpan={intervals.length}>
                      {t(`common.time.daysShort.${day}`)}
                    </Table.Td>
                  )}
                  <Table.Td>{slot.from}:00</Table.Td>
                  <Table.Td>{slot.to}:00</Table.Td>
                </Table.Tr>
              ));
            })}
          </Table.Tbody>
        </Table>
      )}
    </Paper>
  );
}
