import { useState, useEffect } from "react";
import { TextInput, Button, Stack, Title } from "@mantine/core";
import type { CreatePatientDto } from "../../types/patient";
import { useCreatePatient } from "../../hooks/useCreatePatient";
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
  const { isLoading, isSuccess, errors, submit } = useCreatePatient();

  useEffect(() => {
    if (isSuccess) {
      setForm(emptyForm);
    }
  }, [isSuccess]);

  const handleChange = (field: keyof CreatePatientDto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    submit(form);
  };

  return (
    <Stack gap="md" maw={480}>
      <Title order={2}>{t("patient.form.title")}</Title>

      <TextInput
        label={t("patient.form.firstName")}
        value={form.firstName}
        onChange={(e) => handleChange("firstName", e.target.value)}
        error={errors.firstName}
        required
      />
      <TextInput
        label={t("patient.form.lastName")}
        value={form.lastName}
        onChange={(e) => handleChange("lastName", e.target.value)}
        error={errors.lastName}
        required
      />
      <TextInput
        label={t("patient.form.email")}
        type="email"
        value={form.email}
        onChange={(e) => handleChange("email", e.target.value)}
        error={errors.email}
        required
      />
      <TextInput
        label={t("patient.form.birthNumber")}
        value={form.birthNumber ?? ""}
        onChange={(e) => handleChange("birthNumber", e.target.value)}
        error={errors.birthNumber}
        required
      />
      <TextInput
        label={t("patient.form.birthdate")}
        type="date"
        value={form.birthdate ?? ""}
        onChange={(e) => handleChange("birthdate", e.target.value)}
        error={errors.birthdate}
        required
      />
      <TextInput
        label={t("patient.form.phone")}
        value={form.phone ?? ""}
        onChange={(e) => handleChange("phone", e.target.value)}
        error={errors.phone}
        required
      />

      <Button onClick={handleSubmit} loading={isLoading} fullWidth>
        {t("patient.form.submit")}
      </Button>
    </Stack>
  );
};
