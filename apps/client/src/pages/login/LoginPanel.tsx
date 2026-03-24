import {
  TextInput,
  PasswordInput,
  Anchor,
  Title,
  Button,
  Stack,
  Center,
  Group,
} from "@mantine/core";
import { FormEvent, forwardRef, useImperativeHandle, useState } from "react";
import { useT } from "../../hooks/useT.ts";
import { loginSchema } from "@clinio/shared";
import { useLogin } from "../../hooks/useLogin.ts";

interface LoginPanelProps {
  onForgotPassword?: () => void;
  onSignUp: () => void;
}

export interface LoginPanelRef {
  prefillEmail: (email: string) => void;
}

export const LoginPanel = forwardRef<LoginPanelRef, LoginPanelProps>(
  ({ onForgotPassword, onSignUp }, ref) => {
    const t = useT();
    const { mutateAsync, isPending } = useLogin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [touched, setTouched] = useState(false);

    useImperativeHandle(ref, () => ({
      prefillEmail: (value) => setEmail(value),
    }));

    const passwordValidation = touched
      ? loginSchema.shape.password.safeParse(password)
      : null;
    const passwordError =
      passwordValidation && !passwordValidation.success
        ? passwordValidation.error.issues[0].message
        : undefined;

    const isValid = !passwordError && !!email && !!password;

    const handleLogin = async (event: FormEvent) => {
      event.preventDefault();
      await mutateAsync({ email, password });
    };

    return (
      <>
        <Title ta="center" c="blue" order={1} mb="xl">
          {t("login.welcome")}
        </Title>

        <form onSubmit={handleLogin}>
          <Stack>
            <TextInput
              placeholder={t("login.emailPlaceholder")}
              label={t("login.emailLabel")}
              radius="md"
              size="md"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />

            <PasswordInput
              placeholder={t("login.passwordPlaceholder")}
              label={t("login.passwordLabel")}
              radius="md"
              size="md"
              value={password}
              error={passwordError}
              onBlur={() => setTouched(true)}
              onChange={(e) => {
                setTouched(true);
                setPassword(e.currentTarget.value);
              }}
            />
          </Stack>

          <Button
            fullWidth
            mt="xl"
            variant="outline"
            radius="xl"
            size="md"
            type="submit"
            disabled={!isValid}
            loading={isPending}
          >
            {t("login.submitButton")}
          </Button>
        </form>

        <Center mt="md">
          <Group gap="xs">
            <Anchor
              component="button"
              size="sm"
              c="dimmed"
              onClick={onForgotPassword}
            >
              {t("login.forgotPassword")}
            </Anchor>

            <Anchor component="button" size="sm" c="dimmed" onClick={onSignUp}>
              {t("login.signUp")}
            </Anchor>
          </Group>
        </Center>
      </>
    );
  }
);
