import { Badge, Button, Group, Paper, TextInput, Title } from "@mantine/core";
import { useMatch, useNavigate, useParams } from "react-router";
import { useT, useUserRole } from "@hooks";
import { BackButton } from "@components";
import { ROUTER_PATHS } from "@router";
import { useManageOfficeFormContext } from "../../../components/office/ManageOfficeForm/ManageOfficeFormContext";
import { Office } from "@clinio/api";

type Props = {
  office: Office | null;
  editing: boolean;
  isNew: boolean;
  isPending: boolean;
  backTo: string;
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
  backTo,
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

  const isCreateRoute = !!useMatch(ROUTER_PATHS.OFFICE_NEW);
  const isAppointmentsRoute = !!useMatch(ROUTER_PATHS.OFFICE_APPOINTMENTS);
  const isOfficeDetailRoute =
    !!useMatch(ROUTER_PATHS.OFFICE_DETAIL) && !isCreateRoute;
  // Save/Cancel show whenever the user is editing (including /new).
  // Edit/Delete + appointments shortcut only show on the existing-office detail route.
  const canShowEditingButtons = !isClient;
  const canShowViewingButtons = !isClient && isOfficeDetailRoute;
  const canShowAppointmentsLink = !isAdmin && isOfficeDetailRoute && !!id;

  // On the appointments sub-route, "back" returns to the office detail
  // (which is itself reachable via its own back button → offices overview).
  const resolvedBackTo =
    isAppointmentsRoute && id ? ROUTER_PATHS.OFFICE_DETAIL_ID(id) : backTo;
  const backLabel = isAppointmentsRoute
    ? t("office.detail.backToDetail")
    : undefined;

  return (
    <Paper p="lg" radius="md" shadow="sm" withBorder>
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
            <BackButton to={resolvedBackTo} label={backLabel} />
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
                {t(isNew ? "office.form.buttons.submit" : "common.action.save")}
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
    </Paper>
  );
}
