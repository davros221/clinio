import {
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useMatch, useNavigate, useParams } from "react-router";
import { useT, useUserRole } from "@hooks";
import { BackButton, Breadcrumbs, type BreadcrumbItem } from "@components";
import { ROUTER_PATHS } from "@router";
import { useManageOfficeFormContext } from "../../../components/office/ManageOfficeForm/ManageOfficeFormContext";
import { Office } from "@clinio/api";

type Props = {
  office: Office | null;
  editing: boolean;
  isNew: boolean;
  isPending: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
};

export function OfficeDetailHeader({
  office,
  editing,
  isNew,
  isPending,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: Props) {
  const t = useT();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const form = useManageOfficeFormContext();
  const { isAdmin, isClient } = useUserRole();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const isCreateRoute = !!useMatch(ROUTER_PATHS.OFFICE_NEW);
  const isAppointmentsRoute = !!useMatch(ROUTER_PATHS.OFFICE_APPOINTMENTS);
  const isOfficeDetailRoute =
    !!useMatch(ROUTER_PATHS.OFFICE_DETAIL) && !isCreateRoute;
  // Save/Cancel show whenever the user is editing (including /new).
  // Edit/Delete + appointments shortcut only show on the existing-office detail route.
  const canShowEditingButtons = !isClient;
  const canShowViewingButtons = !isClient && isOfficeDetailRoute;
  const canShowAppointmentsLink = !isAdmin && isOfficeDetailRoute && !!id;

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: t("office.overview.title"), to: ROUTER_PATHS.OFFICES },
  ];
  if (isCreateRoute) {
    breadcrumbItems.push({ label: t("office.detail.breadcrumb.new") });
  } else if (isAppointmentsRoute && id) {
    breadcrumbItems.push({
      label: office?.name ?? "",
      to: ROUTER_PATHS.OFFICE_DETAIL_ID(id),
    });
    breadcrumbItems.push({
      label: t("office.detail.breadcrumb.appointments"),
    });
  } else {
    breadcrumbItems.push({ label: office?.name ?? "" });
  }

  const previousCrumb = breadcrumbItems[breadcrumbItems.length - 2];
  const trailNav =
    isMobile && previousCrumb?.to ? (
      <BackButton to={previousCrumb.to} label={previousCrumb.label} />
    ) : (
      <Breadcrumbs items={breadcrumbItems} />
    );

  return (
    <Paper p="lg" radius="md" shadow="sm" withBorder>
      <Stack gap="sm">
        {trailNav}
        <Group justify="space-between" wrap="wrap">
          {editing ? (
            <Group wrap="wrap" style={{ flex: 1 }}>
              <TextInput
                key={form.key("name")}
                label={t("office.form.fields.name")}
                placeholder={t("office.form.fields.namePlaceholder")}
                {...form.getInputProps("name")}
              />
              <TextInput
                key={form.key("specialization")}
                label={t("office.form.fields.specialization")}
                placeholder={t("office.form.fields.specializationPlaceholder")}
                {...form.getInputProps("specialization")}
              />
            </Group>
          ) : (
            <Group wrap="wrap">
              <Title order={1}>{office?.name}</Title>
              <Badge variant="light" color="blue" size="lg">
                {office?.specialization}
              </Badge>
            </Group>
          )}

          {editing ? (
            canShowEditingButtons && (
              <Group wrap="wrap">
                <Button loading={isPending} onClick={onSave}>
                  {t(
                    isNew ? "office.form.buttons.submit" : "common.action.save"
                  )}
                </Button>
                <Button variant="outline" color="gray" onClick={onCancel}>
                  {t("common.action.cancel")}
                </Button>
              </Group>
            )
          ) : (
            <Group wrap="wrap">
              {canShowAppointmentsLink && id && (
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(ROUTER_PATHS.OFFICE_APPOINTMENTS_ID(id))
                  }
                >
                  {t("office.detail.viewAppointments")}
                </Button>
              )}
              {canShowViewingButtons && (
                <>
                  <Button onClick={onEdit}>{t("common.action.edit")}</Button>
                  {isAdmin && (
                    <Button variant="outline" color="red" onClick={onDelete}>
                      {t("common.action.delete")}
                    </Button>
                  )}
                </>
              )}
            </Group>
          )}
        </Group>
      </Stack>
    </Paper>
  );
}
