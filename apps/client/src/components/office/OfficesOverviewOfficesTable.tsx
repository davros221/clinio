import { DataTable } from "../DataTable.tsx";
import {
  Office,
  OfficeHoursInterval,
  OfficeHoursTemplateDto,
} from "@clinio/api";
import { useCallback, useMemo } from "react";
import { useDeleteOfficeMutation, useGetOfficeListQuery } from "@api";
import { Button, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { ManageOfficeModalOpenBtn } from "./ManageOfficeModal/ManageOfficeModalOpenBtn.tsx";
import { useT, useUser } from "@hooks";
import { DAYS, UserRole } from "@clinio/shared";

const TOP_ALIGN_LEFT: React.CSSProperties = {
  verticalAlign: "top",
  textAlign: "left",
};

function OfficeHoursCell({ template }: { template: OfficeHoursTemplateDto }) {
  const t = useT();

  if (!template || typeof template !== "object") return null;

  return (
    <Stack gap={2} align="center">
      {DAYS.map((day) => {
        const intervals = template[day];
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
          <div
            key={day}
            style={{
              display: "flex",
              gap: 4,
              alignItems: "baseline",
              width: "100%",
            }}
          >
            <Text fw={800} size="sm" c="dimmed" style={{ flexShrink: 0 }}>
              {t(`common.time.daysShort.${day}`)}:
            </Text>
            <Text size="sm" style={{ minWidth: 0, wordBreak: "break-word" }}>
              {timeString}
            </Text>
          </div>
        );
      })}
    </Stack>
  );
}

function OfficeActionCell({
  id,
  onDelete,
}: {
  id: string;
  onDelete: (id: string) => void;
}) {
  const t = useT();
  const { user } = useUser();
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <Stack gap="xxs" justify="space-between" h="100%">
      <ManageOfficeModalOpenBtn officeId={id} />

      {isAdmin && (
        <Button
          size="xs"
          variant="outline"
          color="red"
          onClick={() => onDelete(id)}
        >
          {t("common.action.delete")}
        </Button>
      )}
    </Stack>
  );
}

export function OfficesOverviewOfficesTable() {
  const t = useT();
  const {
    data: offices = [],
    isLoading,
    isError,
    error,
  } = useGetOfficeListQuery();
  const { mutate: deleteOffice } = useDeleteOfficeMutation();

  const handleDelete = useCallback(
    (id: string) => {
      modals.openConfirmModal({
        title: t("office.deleteModal.title"),
        centered: true,
        children: <Text size="sm">{t("office.deleteModal.message")}</Text>,
        labels: {
          confirm: t("office.deleteModal.confirm"),
          cancel: t("office.deleteModal.cancel"),
        },
        confirmProps: { color: "red" },
        onConfirm: () => deleteOffice({ path: { id } }),
      });
    },
    [t, deleteOffice]
  );

  const columns = useMemo(
    () => [
      {
        key: "action",
        header: t("office.overview.officesListHeader.action"),
        style: TOP_ALIGN_LEFT,
        render: ({ id }: Office) => (
          <OfficeActionCell id={id} onDelete={handleDelete} />
        ),
      },
      {
        key: "name",
        header: t("office.overview.officesListHeader.name"),
        style: TOP_ALIGN_LEFT,
      },
      {
        key: "specialization",
        header: t("office.overview.officesListHeader.specialization"),
        style: TOP_ALIGN_LEFT,
      },
      {
        key: "address",
        header: t("office.overview.officesListHeader.address"),
        style: TOP_ALIGN_LEFT,
      },
      {
        key: "officeHours",
        header: t("office.overview.officesListHeader.officeHours"),
        render: (row: Office) => (
          <OfficeHoursCell template={row.officeHoursTemplate} />
        ),
      },
    ],
    [t, handleDelete]
  );

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
