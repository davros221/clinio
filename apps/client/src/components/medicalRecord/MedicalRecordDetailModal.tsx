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

type Props = {
  record: MedicalRecord | null;
  opened: boolean;
  onClose: () => void;
};

export function MedicalRecordDetailModal({ record, opened, onClose }: Props) {
  const t = useT();

  if (!record) return null;

  const createdAtDisplay = new Date(record.createdAt).toLocaleDateString();

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

        <Group justify="flex-end" mt="sm">
          <Button variant="outline" color="gray" onClick={onClose}>
            {t("medicalRecord.createModal.buttons.cancel")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
