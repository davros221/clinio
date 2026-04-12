import { useUserFormContext } from "@form";
import { Stack, TextInput } from "@mantine/core";
import { useT } from "@hooks";

export const CreateUserFormPatientFields = () => {
  const form = useUserFormContext();
  const t = useT();
  return (
    <Stack gap={"md"}>
      <TextInput
        label={t("patient.form.birthNumber")}
        {...form.getInputProps("birthNumber")}
      />
      <TextInput
        type="date"
        label={t("patient.form.birthdate")}
        {...form.getInputProps("birthdate")}
      />
      <TextInput
        label={t("patient.form.phone")}
        {...form.getInputProps("phone")}
      />
    </Stack>
  );
};
