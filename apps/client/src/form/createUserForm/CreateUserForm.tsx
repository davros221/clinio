import { useUserFormContext } from "./CreateUserFormContext.ts";
import { PasswordInput, SimpleGrid, Stack, TextInput } from "@mantine/core";
import { useT } from "@hooks";
import { CreateUserFormPatientFields } from "./components/CreateUserFormPatientFields.tsx";
import { CreateUserFormRoleSelect } from "./components/CreateUserFormRoleSelect.tsx";

type Props = {
  userRole: "staff" | "patient";
  withPassword?: boolean;
};

/**
 * base form component with no submit handler, so it can be fired from everywhere
 * @constructor
 */
export const CreateUserForm = (props: Props) => {
  const t = useT();
  const { userRole, withPassword = false } = props;
  const form = useUserFormContext();

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
      <Stack gap="md">
        <TextInput
          label={t("patient.form.firstName")}
          {...form.getInputProps("firstName")}
        />
        <TextInput
          label={t("patient.form.lastName")}
          {...form.getInputProps("lastName")}
        />
        <TextInput
          label={t("patient.form.email")}
          {...form.getInputProps("email")}
        />
      </Stack>
      {userRole === "patient" && <CreateUserFormPatientFields />}
      {userRole === "staff" && <CreateUserFormRoleSelect />}
      {withPassword && (
        <>
          <PasswordInput
            label={t("patient.form.password")}
            {...form.getInputProps("password")}
          />

          <PasswordInput
            label={t("patient.form.passwordConfirm")}
            {...form.getInputProps("passwordConfirm")}
          />
        </>
      )}
    </SimpleGrid>
  );
};
