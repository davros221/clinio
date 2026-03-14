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
import { FormEvent, useState } from "react";
import { loginSchema } from "@clinio/shared";
import { useLogin } from "../../hooks/useLogin.ts";

interface LoginPanelProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onForgotPassword?: () => void;
  onSignUp: () => void;
}

export const LoginPanel = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onForgotPassword,
  onSignUp,
}: LoginPanelProps) => {
  const { login, loading } = useLogin();
  const [touched, setTouched] = useState(false);

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
    await login(email, password);
  };

  return (
    <>
      <Title ta="center" c="blue" order={1} mb="xl">
        WELCOME!
      </Title>

      <form onSubmit={handleLogin}>
        <Stack>
          <TextInput
            placeholder="Your e-mail/username"
            label="Email / Username"
            radius="md"
            size="md"
            value={email}
            onChange={(e) => onEmailChange(e.currentTarget.value)}
          />

          <PasswordInput
            placeholder="Your Password"
            label="Password"
            radius="md"
            size="md"
            value={password}
            error={passwordError}
            onBlur={() => setTouched(true)}
            onChange={(e) => {
              setTouched(true);
              onPasswordChange(e.currentTarget.value);
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
          loading={loading}
        >
          Let me In
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
            Forgot password
          </Anchor>

          <Anchor component="button" size="sm" c="dimmed" onClick={onSignUp}>
            Sign Up
          </Anchor>
        </Group>
      </Center>
    </>
  );
};
