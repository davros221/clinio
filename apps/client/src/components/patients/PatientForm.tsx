import { useState } from "react";
import { TextInput, Button, Stack, Title } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import type { CreatePatientDto } from "../../api/patientService";
import { useCreatePatientMutation } from "../../api/patientService";
import { useT } from "../../hooks/useT";

const emptyForm: CreatePatientDto = {
  firstName: "",
  lastName: "",
  email: "",
  birthNumber: "",
  birthdate: "",
  phone: "",
};

export const PatientForm = () => {
  const t = useT();
  const [form, setForm] = useState<CreatePatientDto>(emptyForm);
  const { mutate, isPending } = useCreatePatientMutation();

  const handleChange = (field: keyof CreatePatientDto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    mutate(
      {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        birthNumber: form.birthNumber?.trim(),
        birthdate: form.birthdate?.trim(),
        phone: form.phone?.trim(),
      },
      {
        onSuccess: () => setForm(emptyForm),
      }
    );
  };

  return (
    <Stack gap="md" maw={480}>
      <Title order={2}>{t("patient.form.title")}</Title>

      <TextInput
        label={t("patient.form.firstName")}
        value={form.firstName}
        onChange={(e) => handleChange("firstName", e.target.value)}
        required
      />
      <TextInput
        label={t("patient.form.lastName")}
        value={form.lastName}
        onChange={(e) => handleChange("lastName", e.target.value)}
        required
      />
      <TextInput
        label={t("patient.form.email")}
        type="email"
        value={form.email}
        onChange={(e) => handleChange("email", e.target.value)}
        required
      />
      <TextInput
        label={t("patient.form.birthNumber")}
        value={form.birthNumber ?? ""}
        onChange={(e) => handleChange("birthNumber", e.target.value)}
        required
      />
      <DatePickerInput
        label={t("patient.form.birthdate")}
        valueFormat="DD-MM-YYYY"
        placeholder="DD-MM-YYYY"
        value={form.birthdate ? new Date(form.birthdate) : null}
        onChange={(date) =>
          handleChange(
            "birthdate",
            date ? new Date(date).toISOString().split("T")[0] : ""
          )
        }
        required
        dropdownType="modal"
      />
      <TextInput
        label={t("patient.form.phone")}
        value={form.phone ?? ""}
        onChange={(e) => handleChange("phone", e.target.value)}
        required
      />

      <Button onClick={handleSubmit} loading={isPending} fullWidth>
        {t("patient.form.submit")}
      </Button>
    </Stack>
  );
};
