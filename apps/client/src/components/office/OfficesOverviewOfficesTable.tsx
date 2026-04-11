import { Office, OfficeHoursTemplateDto } from "@clinio/api";
import { useCallback, useMemo } from "react";
import {
  useDeleteOfficeMutation,
  useGetOfficeListQuery,
} from "../../api/officeService.ts";
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
import { useT } from "../../hooks/useT";
import { DAYS } from "@clinio/shared";
import { useUserRole } from "../../hooks/useUserRole.ts";
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

  const mapSrc = useMemo(() => {
    const query = encodeURIComponent(office.address);
    return `https://maps.google.com/maps?q=${query}&output=embed`;
  }, [office.address]);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack justify="space-between" h="100%" className={classes.cardContent}>
        <Group>
          <Title size="lg">{office.name}</Title>
          <Badge variant="light" color="blue">
            {office.specialization}
          </Badge>
        </Group>

        <Group h="100%" align="stretch" className={classes.body}>
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

            <Stack>
              <Stack gap="none">
                <Text size="sm" c="dimmed">
                  Address:
                </Text>
                <Text size="md">{office.address}</Text>
              </Stack>

              <Stack gap="4xs">
                <Text size="sm" c="dimmed">
                  office hours:
                </Text>
                <OfficeHoursSummary template={office.officeHoursTemplate} />
              </Stack>
            </Stack>
          </Stack>

          <iframe
            src={mapSrc}
            title={`Map: ${office.address}`}
            className={classes.map}
            loading="lazy"
            referrerPolicy="no-referrer"
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
      <Alert color="red" title="Error">
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
