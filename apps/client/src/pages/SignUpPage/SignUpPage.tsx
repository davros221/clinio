import { Title, Box } from "@mantine/core";
import { useT } from "@hooks";
import { useSignUpPage } from "./useSignUpPage.ts";
import { AuthFooter, SubmitButton } from "@components";
import { CreateUserForm, UserFormProvider } from "@form";

const FORM_ID = "createUserForm";

export const SignUpPage = () => {
  const t = useT();
  const { handleSubmit, form, isPending } = useSignUpPage();

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

      <SubmitButton type={"submit"} form={FORM_ID} loading={isPending}>
        {t("signUp.submitButton")}
      </SubmitButton>

      <AuthFooter links={["login"]} />
    </Box>
  );
};
