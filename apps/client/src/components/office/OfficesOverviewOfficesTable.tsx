import {
  Office,
  OfficeHoursInterval,
  OfficeHoursTemplateDto,
} from "@clinio/api";
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
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { ManageOfficeModalOpenBtn } from "./ManageOfficeModal/ManageOfficeModalOpenBtn.tsx";
import { useT } from "../../hooks/useT";
import { DAYS } from "@clinio/shared";
import { useUserRole } from "../../hooks/useUserRole.ts";

function OfficeHoursSummary({
  template,
}: {
  template: OfficeHoursTemplateDto;
}) {
  const t = useT();

  if (!template || typeof template !== "object") return null;

  return (
    <Stack gap={2}>
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
          .map((slot) => `${slot.from}:00\u2013${slot.to}:00`)
          .join(", ");

        if (!timeString) return null;

        return (
          <Group key={day} gap={4} wrap="nowrap">
            <Text fw={700} size="xs" c="dimmed" style={{ flexShrink: 0 }}>
              {t(`common.time.daysShort.${day}`)}
            </Text>
            <Text size="xs">{timeString}</Text>
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
    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
      <Group wrap="nowrap" align="stretch" h="100%" gap="lg">
        <Stack justify="space-between" style={{ flex: 1, minWidth: 0 }}>
          <Stack gap="sm">
            <Group justify="space-between" align="flex-start">
              <Text fw={600} size="lg">
                {office.name}
              </Text>
              <Badge variant="light" color="blue">
                {office.specialization}
              </Badge>
            </Group>

            <Text size="sm" c="dimmed">
              {office.address}
            </Text>

            <OfficeHoursSummary template={office.officeHoursTemplate} />
          </Stack>

          <Group mt="md">
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
        </Stack>

        <iframe
          src={mapSrc}
          title={`Map: ${office.address}`}
          style={{
            border: 0,
            borderRadius: 8,
            width: 250,
            minHeight: 200,
            flexShrink: 0,
          }}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </Group>
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
    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
      {offices.map((office) => (
        <OfficeCard key={office.id} office={office} onDelete={handleDelete} />
      ))}
    </SimpleGrid>
  );
}
