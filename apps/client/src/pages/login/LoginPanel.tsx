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
    const { login, loading } = useLogin();
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
              onChange={(e) => setEmail(e.currentTarget.value)}
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
  }
);
