import { Anchor, Title, Center, Group } from "@mantine/core";
import { UserFormProvider } from "../../form/createUserForm/CreateUserFormContext.ts";
import { CreateUserForm } from "../../form/createUserForm/CreateUserForm.tsx";
import { useT } from "../../hooks/useT.ts";
import { useSignUpPage } from "./useSignUpPage.ts";

const FORM_ID = "createUserForm";

// ToDo
interface Props {
  onSuccess?: (email: string) => void;
}

export const SignUpPage = (props: Props) => {
  const t = useT();
  const { handleSubmit, form, isPending, handleLogin } = useSignUpPage();

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
        <Group gap="xs">
          <Anchor
            component="button"
            size="sm"
            c="dimmed"
            type={"submit"}
            form={FORM_ID}
            disabled={isPending}
          >
            {t("login.signUp")}
          </Anchor>

          {/* ToDo: Back link will be fixed in login panels refactor commit */}
          <Anchor
            component="button"
            size="sm"
            c="dimmed"
            type={"button"}
            onClick={handleLogin}
          >
            {t("signUp.backToLogin")}
          </Anchor>
        </Group>
      </Center>
    </>
  );
};
