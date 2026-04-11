import { TextInput, Button, Stack, Title } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import {
  useCreatePatientMutation,
  type CreatePatientDto,
} from "../../api/patientService";
import { useT } from "../../hooks/useT";

export const PatientForm = () => {
  const t = useT();
  const { mutate, isPending } = useCreatePatientMutation();

  const form = useForm<CreatePatientDto>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      birthNumber: "",
      birthdate: "",
      phone: "",
    },
    validate: {
      firstName: (value) =>
        value.trim() ? null : t("common.validation.required"),
      lastName: (value) =>
        value.trim() ? null : t("common.validation.required"),
      email: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? null
          : t("common.validation.required"),
      birthNumber: (value) =>
        value?.length === 10 ? null : t("common.validation.required"),
      birthdate: (value) => (value ? null : t("common.validation.required")),
      phone: (value) =>
        value?.trim() ? null : t("common.validation.required"),
    },
  });

  const handleSubmit = (values: CreatePatientDto) => {
    mutate(
      {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        birthNumber: values.birthNumber?.trim(),
        birthdate: values.birthdate?.trim(),
        phone: values.phone?.trim(),
      },
      {
        onSuccess: () => form.reset(),
      }
    );
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md" maw={480}>
        <Title order={2}>{t("patient.form.title")}</Title>

        <TextInput
          label={t("patient.form.firstName")}
          {...form.getInputProps("firstName")}
          required
        />
        <TextInput
          label={t("patient.form.lastName")}
          {...form.getInputProps("lastName")}
          required
        />
        <TextInput
          label={t("patient.form.email")}
          type="email"
          {...form.getInputProps("email")}
          required
        />
        <TextInput
          label={t("patient.form.birthNumber")}
          {...form.getInputProps("birthNumber")}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 10);
            form.setFieldValue("birthNumber", value);
          }}
          required
        />
        <DatePickerInput
          label={t("patient.form.birthdate")}
          valueFormat="DD-MM-YYYY"
          placeholder="DD-MM-YYYY"
          value={form.values.birthdate ? new Date(form.values.birthdate) : null}
          onChange={(date) =>
            form.setFieldValue(
              "birthdate",
              date ? new Date(date).toISOString().split("T")[0] : ""
            )
          }
          error={form.errors.birthdate}
          required
          dropdownType="modal"
        />
        <TextInput
          label={t("patient.form.phone")}
          {...form.getInputProps("phone")}
          required
        />

        <Button type="submit" loading={isPending} fullWidth>
          {t("patient.form.submit")}
        </Button>
      </Stack>
    </form>
  );
};
