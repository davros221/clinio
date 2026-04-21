import { modals } from "@mantine/modals";
import { Text } from "@mantine/core";
import { t } from "../i18n";

type Options = {
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export const openConfirmModal = ({
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
}: Options) => {
  modals.openConfirmModal({
    title: title ?? t("common.confirmModal.title"),
    centered: true,
    children: (
      <Text size="sm">{message ?? t("common.confirmModal.message")}</Text>
    ),
    labels: {
      confirm: confirmLabel ?? t("common.confirmModal.confirm"),
      cancel: cancelLabel ?? t("common.confirmModal.cancel"),
    },
    confirmProps: { color: "red" },
    onConfirm,
  });
};
