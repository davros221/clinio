import { useState } from "react";
import { TextInput, Button, Stack, Title, Alert } from "@mantine/core";
import type { CreatePatientDto } from "../../types/patient";
import { useCreatePatient } from "../../hooks/useCreatePatient";

const emptyForm: CreatePatientDto = {
  firstName: "",
  lastName: "",
  birthNumber: "",
  birthdate: "",
  email: "",
  phone: "",
  password: "", // ← přidej
};

export const PatientForm = () => {
  const [form, setForm] = useState<CreatePatientDto>(emptyForm);
  const { status, errors, submit } = useCreatePatient();

  const handleChange = (field: keyof CreatePatientDto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    submit(form);
  };

  if (status === "success") {
    return (
      <Alert color="green" title="Hotovo!">
        Pacient byl úspěšně založen.
      </Alert>
    );
  }

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
        label="Heslo"
        type="password"
        value={form.password ?? ""}
        onChange={(e) => handleChange("password", e.target.value)}
        error={errors.password}
        required
      />
      <TextInput
        label="Telefon"
        value={form.phone}
        onChange={(e) => handleChange("phone", e.target.value)}
        error={errors.phone}
        required
      />

      {status === "error" && (
        <Alert color="red" title="Chyba">
          Nepodařilo se založit pacienta. Zkuste to znovu.
        </Alert>
      )}

      <Button onClick={handleSubmit} loading={status === "loading"} fullWidth>
        Založit pacienta
      </Button>
    </Stack>
  );
};
