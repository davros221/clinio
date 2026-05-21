import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { updatePatientSchema } from "@clinio/shared";
import { useT } from "@hooks";
import { useUpdatePatientMutation } from "../../api/patientService";
import { type Patient, type UpdatePatientDto } from "@clinio/api";
import { notifySuccess } from "../../utils/notification";
import { DatePickerInput } from "@mantine/dates";
import { useState } from "react";

type UpdatePatientForm = {
  birthNumber?: string;
  birthdate?: string;
  phone?: string;
};

type Props = {
  patient: Patient;
  opened: boolean;
  onClose: () => void;
};

export function UpdatePatientModal({ patient, opened, onClose }: Props) {
  const t = useT();
  const { mutate: updatePatient, isPending } = useUpdatePatientMutation();

  const form = useForm<UpdatePatientForm>({
    mode: "uncontrolled",
    initialValues: {
      birthNumber: patient.birthNumber ?? undefined,
      birthdate: patient.birthdate ?? undefined,
      phone: patient.phone ?? undefined,
    },
    validate: zod4Resolver(updatePatientSchema),
  });

  const handleSubmit = (values: UpdatePatientForm) => {
    updatePatient(
      { id: patient.id, body: values as UpdatePatientDto },
      {
        onSuccess: () => {
          notifySuccess(
            t("patient.notification.updateSuccessTitle"),
            t("patient.notification.updateSuccessMessage")
          );
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const [birthdateValue, setBirthdateValue] = useState<string | null>(
    patient.birthdate ?? null
  );

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t("patient.updateModal.title")}
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <TextInput
            key={form.key("birthNumber")}
            label={t("patient.updateModal.fields.birthNumber")}
            {...form.getInputProps("birthNumber")}
          />
          <DatePickerInput
            label={t("patient.updateModal.fields.birthdate")}
            valueFormat="DD-MM-YYYY"
            placeholder="DD-MM-YYYY"
            value={birthdateValue ? new Date(birthdateValue) : null}
            onChange={(date) => {
              if (date) {
                const d = new Date(date);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                const formatted = `${year}-${month}-${day}`;
                setBirthdateValue(formatted);
                form.setFieldValue("birthdate", formatted);
              } else {
                setBirthdateValue(null);
                form.setFieldValue("birthdate", "");
              }
            }}
            dropdownType="modal"
          />
          <TextInput
            key={form.key("phone")}
            label={t("patient.updateModal.fields.phone")}
            {...form.getInputProps("phone")}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="outline" color="gray" onClick={handleClose}>
              {t("patient.updateModal.buttons.cancel")}
            </Button>
            <Button type="submit" loading={isPending}>
              {t("patient.updateModal.buttons.submit")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
