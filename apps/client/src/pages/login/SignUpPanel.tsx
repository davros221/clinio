import { Anchor, Title, Center, Button } from "@mantine/core";
import { UserFormProvider } from "../../form/createUserForm/CreateUserFormContext.ts";
import { CreateUserForm } from "../../form/createUserForm/CreateUserForm.tsx";
import { useT } from "../../hooks/useT.ts";
import { useSignUpPanel } from "./useSignUpPanel.ts";

const FORM_ID = "createUserForm";

interface Props {
  onSuccess?: (email: string) => void;
}

export const SignUpPanel = (props: Props) => {
  const t = useT();
  const { handleSubmit, form, isPending } = useSignUpPanel(props);

  return (
    <>
      <Title ta="center" c="blue" order={1} mb="xl">
        {t("signUp.title")}
      </Title>

      <form id={FORM_ID} onSubmit={handleSubmit}>
        <UserFormProvider form={form}>
          <CreateUserForm userRole={"patient"} withPassword={true} />
        </UserFormProvider>
      </form>

      <Center mt="md">
        <Button type={"submit"} form={FORM_ID} mr="md" disabled={isPending}>
          GO!
        </Button>
        <Anchor component="button" size="sm" c="dimmed">
          {t("signUp.backToLogin")}
        </Anchor>
      </Center>
    </>
  );
};
