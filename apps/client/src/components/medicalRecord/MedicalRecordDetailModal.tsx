import {
  Button,
  Group,
  Modal,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { MedicalRecord } from "@clinio/api";
import {
  type UpdateMedicalRecord,
  updateMedicalRecordSchema,
} from "@clinio/shared";
import { useT } from "@hooks";
import {
  useDeletePatientMedicalRecordMutation,
  useUpdatePatientMedicalRecordMutation,
} from "@api";
import { openConfirmModal } from "../../utils/confirmModal";

type Props = {
  record: MedicalRecord;
  opened: boolean;
  onClose: () => void;
};

export function MedicalRecordDetailModal({ record, opened, onClose }: Props) {
  const t = useT();
  const { mutate: deleteRecord, isPending: isDeleting } =
    useDeletePatientMedicalRecordMutation();
  const { mutate: updateRecord, isPending: isUpdating } =
    useUpdatePatientMedicalRecordMutation();

  const form = useForm<UpdateMedicalRecord>({
    mode: "uncontrolled",
    initialValues: {
      examinationSummary: record.examinationSummary ?? null,
      diagnosis: record.diagnosis ?? null,
    },
    validate: zod4Resolver(updateMedicalRecordSchema),
  });

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

  const handleSubmit = (values: UpdateMedicalRecord) => {
    updateRecord(
      {
        path: { patientId: record.patientId, id: record.id },
        body: values,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("medicalRecord.detailModal.title")}
      centered
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
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
            key={form.key("examinationSummary")}
            label={t("medicalRecord.createModal.fields.examinationSummary")}
            autosize
            minRows={3}
            {...form.getInputProps("examinationSummary")}
          />

          <Textarea
            key={form.key("diagnosis")}
            label={t("medicalRecord.createModal.fields.diagnosis")}
            autosize
            minRows={3}
            {...form.getInputProps("diagnosis")}
          />

          <Group justify="space-between" mt="sm">
            <Button
              color="red"
              variant="light"
              onClick={handleDelete}
              loading={isDeleting}
              type="button"
            >
              {t("common.action.delete")}
            </Button>
            <Group>
              <Button
                variant="outline"
                color="gray"
                onClick={onClose}
                type="button"
              >
                {t("medicalRecord.editModal.buttons.cancel")}
              </Button>
              <Button type="submit" loading={isUpdating}>
                {t("medicalRecord.editModal.buttons.submit")}
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
