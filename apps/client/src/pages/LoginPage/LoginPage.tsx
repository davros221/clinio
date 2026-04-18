import { TextInput, PasswordInput, Title, Stack } from "@mantine/core";
import { useT } from "@hooks";
import { useLoginPage } from "./useLoginPage.ts";
import { AuthFooter, SubmitButton } from "@components";

const FORM_ID = "loginForm";

/**
 * ToDo: Google auth - this works for both, login and register, so we can reuse some GoogleAuth component for both pages
 * 1. Redirect user to {API_URL}/api/auth/google ( classic <a> link, not a http req )
 * 2. After google auth, user is redirected back to backend, backend does its stuff, and then back to frontend
 *      - if token is empty, redirect user to login ( shouldn't happen, but just in case )
 * 3. Create route {FRONTEND}/auth/google/callback
 * 4. This page can stay blank, but there is some logic to be done:
 *  - Extract token from url query params ( ?token=aaaaaa )
 *  - !!! IMPORTANT !!! throw token away from url params with {replace: true}, so the token wont stay in browser history
 *  - Store token in local storage ( it's possible to use AuthToken.set() method )
 *  - invalidate /me query, so frontend will automatically successfully fetch user data.
 *  - send user to dashboard
 *  - Done
 */

export const LoginPage = () => {
  const t = useT();
  const { handleSubmit, form, isLoading } = useLoginPage();
  return (
    <Stack miw={300} gap={"lg"}>
      <Title ta="center" c="blue" order={1}>
        {t("login.welcome")}
      </Title>

      <form onSubmit={handleSubmit} id={FORM_ID}>
        <Stack>
          <TextInput
            placeholder={t("login.emailPlaceholder")}
            label={t("login.emailLabel")}
            radius="md"
            size="md"
            {...form.getInputProps("email")}
          />

          <PasswordInput
            placeholder={t("login.passwordPlaceholder")}
            label={t("login.passwordLabel")}
            radius="md"
            size="md"
            {...form.getInputProps("password")}
          />
        </Stack>
      </form>

      <div>
        <SubmitButton type={"submit"} loading={isLoading} form={FORM_ID}>
          {t("login.submitButton")}
        </SubmitButton>
        <AuthFooter links={["forgotPassword", "signUp"]} />
      </div>
    </Stack>
  );
};
