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
import { UserService } from "@clinio/api";
import {
  mapApiErrorToNotification,
  mapSystemErrorToNotification,
  notifySuccess,
} from "../../utils/notification.ts";
import { USER_ROLES } from "../../types/user.ts";
import { useLogin } from "../../hooks/useLogin.ts";

interface SignUpPanelProps {
  onSuccess: (email: string, password: string) => void;
  onBack: () => void;
}

export const SignUpPanel = ({ onSuccess, onBack }: SignUpPanelProps) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useLogin();

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const passwordError =
    password.length > 0 && !passwordRegex.test(password)
      ? "Min 8 chars, upper & lowercase, number, and special character (@$!%*?&)."
      : undefined;

  const passwordsMatch =
    password.length === 0 ||
    passwordConfirm.length === 0 ||
    password === passwordConfirm;

  const isValid =
    email &&
    firstName &&
    lastName &&
    password &&
    !passwordError &&
    passwordConfirm &&
    password === passwordConfirm;

  const handleSignUp = async (event: FormEvent) => {
    event.preventDefault();

    setLoading(true);
    try {
      const { error } = await UserService.create({
        body: {
          email,
          firstName,
          lastName,
          password,
          role: USER_ROLES.CLIENT,
        },
      });

      if (error && typeof error === "object") {
        mapApiErrorToNotification(error);
        return;
      }

      notifySuccess(
        "Account created!",
        "Logging you in automatically, welcome to Clinio!"
      );
      await login(email, password);
      onSuccess(email, password);
    } catch (networkError) {
      mapSystemErrorToNotification(networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Title ta="center" c="blue" order={1} mb="xl">
        CREATE ACCOUNT
      </Title>

      <form onSubmit={handleSignUp}>
        <Stack>
          <TextInput
            placeholder="Your e-mail"
            label="Email"
            radius="md"
            size="md"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />

          <Group grow>
            <TextInput
              placeholder="First name"
              label="First Name"
              radius="md"
              size="md"
              value={firstName}
              onChange={(e) => setFirstName(e.currentTarget.value)}
            />
            <TextInput
              placeholder="Last name"
              label="Last Name"
              radius="md"
              size="md"
              value={lastName}
              onChange={(e) => setLastName(e.currentTarget.value)}
            />
          </Group>

          <PasswordInput
            placeholder="Password"
            label="Password"
            radius="md"
            size="md"
            value={password}
            error={passwordError}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />

          <PasswordInput
            placeholder="Confirm password"
            label="Confirm Password"
            radius="md"
            size="md"
            value={passwordConfirm}
            error={!passwordsMatch ? "Passwords do not match" : undefined}
            onChange={(e) => setPasswordConfirm(e.currentTarget.value)}
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
          Create Account
        </Button>
      </form>

      <Center mt="md">
        <Anchor component="button" size="sm" c="dimmed" onClick={onBack}>
          Back to Login
        </Anchor>
      </Center>
    </>
  );
};
