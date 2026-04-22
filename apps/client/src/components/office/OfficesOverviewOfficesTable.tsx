import { Office, OfficeHoursTemplateDto } from "@clinio/api";
import { Link } from "react-router";
import { MapPreview } from "../MapPreview";
import { useGetOfficeListQuery } from "@api";
import {
  Alert,
  Badge,
  Card,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useT } from "@hooks";
import { DAYS } from "@clinio/shared";
import { ROUTER_PATHS } from "../../router/routes.ts";
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

function OfficeCard({ office }: { office: Office }) {
  const t = useT();

  return (
    <Card
      component={Link}
      to={ROUTER_PATHS.OFFICE_DETAIL_ID(office.id)}
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className={classes.card}
    >
      <Stack justify="space-between" h="100%" className={classes.cardContent}>
        <Group>
          <Title size="lg">{office.name}</Title>
          <Badge variant="light" color="blue">
            {office.specialization}
          </Badge>
        </Group>

        <Stack gap="none">
          <Text size="sm" c="dimmed">
            {t("office.overview.officesListHeader.address")}:
          </Text>
          <Text size="md">{office.address}</Text>
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
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
      {offices.map((office) => (
        <OfficeCard key={office.id} office={office} />
      ))}
    </SimpleGrid>
  );
}
