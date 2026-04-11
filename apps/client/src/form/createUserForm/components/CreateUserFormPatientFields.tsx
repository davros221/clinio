import { useUserFormContext } from "../CreateUserFormContext.ts";
import { TextInput } from "@mantine/core";
import { useT } from "../../../hooks/useT.ts";

export const CreateUserFormPatientFields = () => {
  const form = useUserFormContext();
  const t = useT();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
    </div>
  );
};
