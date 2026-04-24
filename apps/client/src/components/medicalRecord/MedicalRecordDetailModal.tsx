import {
  Button,
  Group,
  Modal,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { MedicalRecord } from "@clinio/api";
import { useT } from "@hooks";
import { useDeletePatientMedicalRecordMutation } from "@api";
import { openConfirmModal } from "../../utils/confirmModal";

type Props = {
  record: MedicalRecord | null;
  opened: boolean;
  onClose: () => void;
};

export function MedicalRecordDetailModal({ record, opened, onClose }: Props) {
  const t = useT();
  const { mutate: deleteRecord, isPending } =
    useDeletePatientMedicalRecordMutation();

  if (!record) return null;

  const createdAtDisplay = new Date(record.createdAt).toLocaleDateString();

  const handleDelete = () => {
    openConfirmModal({
      onConfirm: () =>
        deleteRecord(
          { path: { patientId: record.patientId, id: record.id } },
          { onSuccess: onClose }
        ),
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("medicalRecord.detailModal.title")}
      centered
      size="lg"
    >
      <Stack gap="sm">
        <TextInput
          label={t("medicalRecord.createModal.fields.createdAt")}
          value={createdAtDisplay}
          readOnly
        />

        <TextInput
          label={t("medicalRecord.createModal.fields.createdBy")}
          value={`${record.creator.firstName} ${record.creator.lastName}`}
          readOnly
        />

        <Textarea
          label={t("medicalRecord.createModal.fields.examinationSummary")}
          value={record.examinationSummary ?? ""}
          readOnly
          autosize
          minRows={3}
        />

        <Textarea
          label={t("medicalRecord.createModal.fields.diagnosis")}
          value={record.diagnosis ?? ""}
          readOnly
          autosize
          minRows={3}
        />

        <Group justify="space-between" mt="sm">
          <Button
            color="red"
            variant="light"
            onClick={handleDelete}
            loading={isPending}
          >
            {t("common.action.delete")}
          </Button>
          <Button variant="outline" color="gray" onClick={onClose}>
            {t("medicalRecord.createModal.buttons.cancel")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
