import { Button, Group, Modal, Text } from "@mantine/core";
import { t } from "../../i18n";

type Props = {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
};

export const ConfirmModal = ({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  loading,
}: Props) => (
  <Modal
    opened={opened}
    onClose={onClose}
    title={title ?? t("common.confirmModal.title")}
    centered
    size="sm"
  >
    <Text size="sm">{message ?? t("common.confirmModal.message")}</Text>
    <Group justify="flex-end" mt="md">
      <Button variant="default" onClick={onClose} disabled={loading}>
        {cancelLabel ?? t("common.confirmModal.cancel")}
      </Button>
      <Button color="red" onClick={onConfirm} loading={loading}>
        {confirmLabel ?? t("common.confirmModal.confirm")}
      </Button>
    </Group>
  </Modal>
);
