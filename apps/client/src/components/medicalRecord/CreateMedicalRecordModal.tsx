import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import {
  type CreateMedicalRecord,
  createMedicalRecordSchema,
} from "@clinio/shared";
import { useT } from "@hooks";
import { useUser } from "../../hooks/useUser";
import {
  useCreatePatientMedicalRecordMutation,
  useGetOfficeListQuery,
} from "@api";

type Props = {
  patientId: string;
  opened: boolean;
  onClose: () => void;
};

export function CreateMedicalRecordModal({
  patientId,
  opened,
  onClose,
}: Props) {
  const t = useT();
  const { user } = useUser();
  const { mutate: createRecord, isPending } =
    useCreatePatientMedicalRecordMutation(patientId);
  const { data: offices = [] } = useGetOfficeListQuery();

  const now = new Date().toLocaleString();
  const createdByName = user ? `${user.firstName} ${user.lastName}` : "";

  const userOffices = offices.map((o) => ({ value: o.id, label: o.name }));

  const form = useForm<CreateMedicalRecord>({
    mode: "uncontrolled",
    initialValues: {
      officeId: undefined,
      examinationSummary: "",
      diagnosis: "",
    },
    validate: zod4Resolver(createMedicalRecordSchema),
  });

  const handleSubmit = (values: CreateMedicalRecord) => {
    createRecord(
      {
        officeId: values.officeId,
        examinationSummary: values.examinationSummary || undefined,
        diagnosis: values.diagnosis || undefined,
      },
      {
        onSuccess: () => {
          form.reset();
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t("medicalRecord.createModal.title")}
      centered
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <TextInput
            label={t("medicalRecord.createModal.fields.createdAt")}
            value={now}
            readOnly
          />

          <TextInput
            label={t("medicalRecord.createModal.fields.createdBy")}
            value={createdByName}
            readOnly
          />

          <Select
            key={form.key("officeId")}
            label={t("medicalRecord.createModal.fields.office")}
            placeholder={t(
              "medicalRecord.createModal.fields.officePlaceholder"
            )}
            data={userOffices}
            {...form.getInputProps("officeId")}
          />

          <Textarea
            key={form.key("examinationSummary")}
            label={t("medicalRecord.createModal.fields.examinationSummary")}
            placeholder={t(
              "medicalRecord.createModal.fields.examinationSummaryPlaceholder"
            )}
            autosize
            minRows={3}
            {...form.getInputProps("examinationSummary")}
          />

          <Textarea
            key={form.key("diagnosis")}
            label={t("medicalRecord.createModal.fields.diagnosis")}
            placeholder={t(
              "medicalRecord.createModal.fields.diagnosisPlaceholder"
            )}
            autosize
            minRows={3}
            {...form.getInputProps("diagnosis")}
          />

          <Group justify="flex-end" mt="sm">
            <Button variant="outline" color="gray" onClick={handleClose}>
              {t("medicalRecord.createModal.buttons.cancel")}
            </Button>
            <Button type="submit" loading={isPending}>
              {t("medicalRecord.createModal.buttons.submit")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
