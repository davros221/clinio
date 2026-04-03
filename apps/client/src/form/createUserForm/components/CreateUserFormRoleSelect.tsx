import { useT } from "../../../hooks/useT.ts";
import { Select } from "@mantine/core";
import { useUserFormContext } from "../CreateUserFormContext.ts";
import { UserRole } from "@clinio/shared";

export const CreateUserFormRoleSelect = () => {
  const t = useT();
  const form = useUserFormContext();

  const selectRoles = [
    { label: t("user.roles.doctor"), value: UserRole.DOCTOR },
    { label: t("user.roles.nurse"), value: UserRole.NURSE },
  ];

  return (
    <Select
      label={t("patient.form.role")}
      data={selectRoles}
      {...form.getInputProps("role")}
    />
  );
};
