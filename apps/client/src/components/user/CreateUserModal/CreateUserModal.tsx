import { Button, Group, Modal } from "@mantine/core";
import { CreateUserForm } from "../../../form/createUserForm/CreateUserForm.tsx";
import { useT } from "../../../hooks/useT.ts";
import { useCreateUserModal } from "./useCreateUserModal.ts";
import { UserFormProvider } from "../../../form/createUserForm/CreateUserFormContext.ts";

export type CreateUserModalProps = {
  opened: boolean;
  onClose: () => void;
  mode?: "patient" | "staff";
};

export function CreateUserModal(props: CreateUserModalProps) {
  const { opened, mode = "patient" } = props;
  const t = useT();
  const { form, isPending, handleClose, handleSubmit } =
    useCreateUserModal(props);
  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t("user.form.title")}
      centered
    >
      <form onSubmit={handleSubmit}>
        <UserFormProvider form={form}>
          <CreateUserForm userRole={mode} withPassword={mode === "staff"} />
        </UserFormProvider>

        <Group justify="flex-end" mt="sm">
          <Button variant="outline" color="gray" onClick={handleClose}>
            {t("common.action.cancel")}
          </Button>
          <Button type="submit" loading={isPending}>
            {t("user.form.submit")}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
