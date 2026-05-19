import { Title, Box, Divider, Center, Loader } from "@mantine/core";
import { useT } from "@hooks";
import { useSignUpPage } from "./useSignUpPage.ts";
import { AuthFooter, GoogleAuthButton, SubmitButton } from "@components";
import { CreateUserForm, UserFormProvider } from "@form";
import { useGetAppStatusQuery } from "@api";

const FORM_ID = "createUserForm";

type SignUpPageFormProps = {
  initialized: boolean;
};

const SignUpPageForm = ({ initialized }: SignUpPageFormProps) => {
  const t = useT();
  const { handleSubmit, form, isPending } = useSignUpPage(initialized);

  return (
    <Box miw={450}>
      <Title ta="center" c="blue" order={1} mb="xl">
        {t("signUp.title")}
      </Title>

      <form id={FORM_ID} onSubmit={handleSubmit}>
        <UserFormProvider form={form}>
          <CreateUserForm
            userRole={initialized ? "patient" : "admin"}
            withPassword={true}
          />
        </UserFormProvider>
      </form>

      <SubmitButton type={"submit"} form={FORM_ID} loading={isPending}>
        {t("signUp.submitButton")}
      </SubmitButton>

      {initialized && (
        <>
          <Divider
            my="sm"
            label={t("login.orDivider")}
            labelPosition="center"
          />
          <GoogleAuthButton />
          <AuthFooter links={["login"]} />
        </>
      )}
    </Box>
  );
};

export const SignUpPage = () => {
  const { data, isLoading } = useGetAppStatusQuery();

  if (isLoading) {
    return (
      <Center mih={200}>
        <Loader />
      </Center>
    );
  }

  const initialized = data?.initialized ?? true;

  return <SignUpPageForm initialized={initialized} />;
};
