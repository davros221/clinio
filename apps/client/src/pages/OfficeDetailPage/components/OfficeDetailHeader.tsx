import { Badge, Button, Group, Paper, TextInput, Title } from "@mantine/core";
import { useT, useUserRole } from "@hooks";
import { useManageOfficeFormContext } from "../../../components/office/ManageOfficeModal/ManageOfficeFormContext";
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
  const form = useManageOfficeFormContext();
  const { isAdmin, isClient } = useUserRole();

  return (
    <Paper p="lg" radius="md" withBorder>
      <Group justify="space-between" wrap="wrap">
        {editing ? (
          <Group wrap="wrap" style={{ flex: 1 }}>
            <TextInput
              key={form.key("name")}
              label={t("office.createOfficeModal.fields.name")}
              placeholder={t("office.createOfficeModal.fields.namePlaceholder")}
              {...form.getInputProps("name")}
            />
            <TextInput
              key={form.key("specialization")}
              label={t("office.createOfficeModal.fields.specialization")}
              placeholder={t(
                "office.createOfficeModal.fields.specializationPlaceholder"
              )}
              {...form.getInputProps("specialization")}
            />
          </Group>
        ) : (
          <Group wrap="wrap">
            <Title order={2}>{office?.name}</Title>
            <Badge variant="light" color="blue" size="lg">
              {office?.specialization}
            </Badge>
          </Group>
        )}

        {!isClient && (
          <Group wrap="wrap">
            {editing ? (
              <>
                <Button loading={isPending} onClick={onSave}>
                  {t(
                    isNew
                      ? "office.createOfficeModal.buttons.submit"
                      : "common.action.save"
                  )}
                </Button>
                <Button variant="outline" color="gray" onClick={onCancel}>
                  {t("common.action.cancel")}
                </Button>
              </>
            ) : (
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
