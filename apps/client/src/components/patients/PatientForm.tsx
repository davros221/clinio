import { useState, useEffect } from "react";
import { TextInput, Button, Stack, Title } from "@mantine/core";
import type { CreatePatientDto } from "../../types/patient";
import { useCreatePatient } from "../../hooks/useCreatePatient";
import { useAuthStore } from "../../stores/authStore";

const emptyForm: CreatePatientDto = {
  firstName: "",
  lastName: "",
  birthNumber: "",
  birthdate: "",
  email: "",
  phone: "",
  password: "",
};

export const PatientForm = () => {
  const [form, setForm] = useState<CreatePatientDto>(emptyForm);
  const { isLoading, isSuccess, errors, submit } = useCreatePatient();
  const { user } = useAuthStore();
  const canSetPassword = user === null || user.role === "ADMIN";

  useEffect(() => {
    if (isSuccess) {
      setForm(emptyForm);
    }
  }, [isSuccess]);

  const handleChange = (field: keyof CreatePatientDto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const dataToSubmit = canSetPassword
      ? form
      : { ...form, password: undefined };
    submit(dataToSubmit);
  };

  return (
    <Stack gap="md" maw={480}>
      <Title order={2}>Nový pacient</Title>

      <TextInput
        label="Jméno"
        value={form.firstName}
        onChange={(e) => handleChange("firstName", e.target.value)}
        error={errors.firstName}
        required
      />
      <TextInput
        label="Příjmení"
        value={form.lastName}
        onChange={(e) => handleChange("lastName", e.target.value)}
        error={errors.lastName}
        required
      />
      <TextInput
        label="Rodné číslo"
        value={form.birthNumber}
        onChange={(e) => handleChange("birthNumber", e.target.value)}
        error={errors.birthNumber}
        required
      />
      <TextInput
        label="Datum narození"
        type="date"
        value={form.birthdate}
        onChange={(e) => handleChange("birthdate", e.target.value)}
        error={errors.birthdate}
        required
      />
      <TextInput
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => handleChange("email", e.target.value)}
        error={errors.email}
        required
      />
      <TextInput
        label="Telefon"
        value={form.phone}
        onChange={(e) => handleChange("phone", e.target.value)}
        error={errors.phone}
        required
      />
      {canSetPassword && (
        <TextInput
          label="Heslo"
          type="password"
          value={form.password ?? ""}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
          required
        />
      )}

      <Button onClick={handleSubmit} loading={isLoading} fullWidth>
        Založit pacienta
      </Button>
    </Stack>
  );
};
