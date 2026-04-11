import { Anchor, Title, Center, Group, Box, Button } from "@mantine/core";
import { UserFormProvider } from "../../form/createUserForm/CreateUserFormContext.ts";
import { CreateUserForm } from "../../form/createUserForm/CreateUserForm.tsx";
import { useT } from "../../hooks/useT.ts";
import { useSignUpPage } from "./useSignUpPage.ts";

const FORM_ID = "createUserForm";

export const SignUpPage = () => {
  const t = useT();
  const { handleSubmit, form, isPending, handleLogin } = useSignUpPage();

  return (
    <Box miw={450}>
      <Title ta="center" c="blue" order={1} mb="xl">
        {t("signUp.title")}
      </Title>

      <form id={FORM_ID} onSubmit={handleSubmit}>
        <UserFormProvider form={form}>
          <CreateUserForm userRole={"patient"} withPassword={true} />
        </UserFormProvider>
      </form>

      <Button
        fullWidth
        mt={"xl"}
        variant={"outlint"}
        radius={"xl"}
        size={"md"}
        type={"submit"}
        form={FORM_ID}
        loading={isPending}
      >
        {t("signUp.submitButton")}
      </Button>

      <Center mt="md">
        <Group gap="xs">
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
    </Box>
  );
};
