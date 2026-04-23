import { useUserFormContext } from "@form";
import { Stack, TextInput } from "@mantine/core";
import { useT } from "@hooks";
import { PhoneInputField } from "@components";

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
      <PhoneInputField
        label={t("patient.form.phone")}
        value={form.getValues().phone ?? ""}
        onChange={(phone) => form.setFieldValue("phone", phone)}
        error={form.errors.phone as string}
      />
    </Stack>
  );
};
