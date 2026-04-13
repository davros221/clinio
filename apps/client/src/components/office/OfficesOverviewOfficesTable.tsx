import { Office, OfficeHoursTemplateDto } from "@clinio/api";
import { useCallback } from "react";
import { MapPreview } from "../MapPreview";
import { useDeleteOfficeMutation, useGetOfficeListQuery } from "@api";
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { ManageOfficeModalOpenBtn } from "./ManageOfficeModal/ManageOfficeModalOpenBtn.tsx";
import { useT, useUserRole } from "@hooks";
import { DAYS } from "@clinio/shared";
import classes from "./OfficesOverviewOfficesTable.module.css";

function OfficeHoursSummary({
  template,
}: {
  template: OfficeHoursTemplateDto;
}) {
  const t = useT();

  return (
    <Stack gap={2}>
      {DAYS.map((day) => {
        const intervals = template[day];
        if (!intervals?.length) return null;

        const timeString = intervals
          .map((slot) => `${slot.from}:00\u2013${slot.to}:00`)
          .join(", ");

        return (
          <Group key={day} gap={4} wrap="nowrap">
            <Text fw={700} size="sm" c="dimmed" className={classes.dayLabel}>
              {t(`common.time.daysShort.${day}`)}
            </Text>
            <Text size="sm">{timeString}</Text>
          </Group>
        );
      })}
    </Stack>
  );
}

function OfficeCard({
  office,
  onDelete,
}: {
  office: Office;
  onDelete: (id: string) => void;
}) {
  const t = useT();
  const { isAdmin } = useUserRole();

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack justify="space-between" h="100%" className={classes.cardContent}>
        <Group>
          <Title size="lg">{office.name}</Title>
          <Badge variant="light" color="blue">
            {office.specialization}
          </Badge>
        </Group>

        <Stack>
          <Group>
            <ManageOfficeModalOpenBtn officeId={office.id} />
            {isAdmin && (
              <Button
                size="xs"
                variant="outline"
                color="red"
                onClick={() => onDelete(office.id)}
              >
                {t("common.action.delete")}
              </Button>
            )}
          </Group>

          <Stack gap="none">
            <Text size="sm" c="dimmed">
              {t("office.overview.officesListHeader.address")}:
            </Text>
            <Text size="md">{office.address}</Text>
          </Stack>
        </Stack>
        <Group h="100%" align="stretch" className={classes.body}>
          <Stack gap="4xs">
            <Text size="sm" c="dimmed">
              {t("office.overview.officesListHeader.officeHours")}:
            </Text>
            <OfficeHoursSummary template={office.officeHoursTemplate} />
          </Stack>

          <MapPreview
            address={office.address}
            title={`Map: ${office.address}`}
            className={classes.map}
          />
        </Group>
      </Stack>
    </Card>
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

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <Alert color="red" title={t("common.error.general")}>
        {error instanceof Error ? error.message : String(error)}
      </Alert>
    );
  }

  return (
    <SimpleGrid cols={{ base: 2 }} spacing="lg">
      {offices.map((office) => (
        <OfficeCard key={office.id} office={office} onDelete={handleDelete} />
      ))}
    </SimpleGrid>
  );
}
