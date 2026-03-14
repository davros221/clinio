import {
  TextInput,
  PasswordInput,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Button,
  Stack,
  Center,
  Group,
} from "@mantine/core";
import { useState, FormEvent } from "react";
import { AuthService } from "@clinio/api";
import "../api/client";
import { router } from "../router/router.tsx";
import { ROUTER_PATHS } from "../router/routes.ts";
import {
  mapApiErrorToNotification,
  mapSystemErrorToNotification,
} from "../utils/notification";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();

    const clearStorage = () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    };

    try {
      const { data, error } = await AuthService.login({
        body: {
          email,
          password,
        },
      });

      // local storage sanitization
      if (error && typeof error === "object") {
        mapApiErrorToNotification(error);
        clearStorage();
        return;
      }

      // 2. Handle Success
      if (data && data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.authData));

        await router.navigate(ROUTER_PATHS.HOME);
      }
    } catch (networkError) {
      // 3. Handle Network crashes or unexpected code errors
      mapSystemErrorToNotification(networkError);
      clearStorage();
    }
  };

  return (
    <Center h="100dvh">
      <Container size={420} w="100%">
        <Paper withBorder shadow="md" p={40} radius="md">
          <Text size="lg" fw={700} mb="xl" c="blue">
            ClinIO
          </Text>

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
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
            </Stack>

            <Button
              fullWidth
              mt="xl"
              variant="outline"
              radius="xl"
              size="md"
              type="submit"
              value="Submit"
              disabled={!email || !password}
            >
              Let me In
            </Button>
          </form>

          {/*TBD */}
          <Center mt="md">
            <Group gap="xs">
              <Anchor component="button" size="sm" c="dimmed">
                Forgot password
              </Anchor>

              <Anchor component="button" size="sm" c="dimmed">
                Sign Up
              </Anchor>
            </Group>
          </Center>
        </Paper>
      </Container>
    </Center>
  );
};
