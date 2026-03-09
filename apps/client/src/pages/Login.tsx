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
} from "@mantine/core";

export function Login() {
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

          <Stack>
            <TextInput
              placeholder="Your e-mail/username"
              radius="md"
              size="md"
            />

            <PasswordInput placeholder="Your Password" radius="md" size="md" />
          </Stack>

          <Button
            fullWidth
            mt="xl"
            variant="outline"
            radius="xl"
            size="md"
            onClick={() => alert("dev in progress")}
          >
            Let me In
          </Button>

          <Center mt="md">
            <Anchor component="button" size="sm" c="dimmed">
              Forgot password
            </Anchor>
          </Center>
        </Paper>
      </Container>
    </Center>
  );
}
