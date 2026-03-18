import { SimpleGrid, Card, Text, Button, Group } from "@mantine/core";

export const QuickActions = () => {
  return (
    <SimpleGrid cols={3} mb="xl">
      <Card withBorder shadow="sm">
        <Text fw={600}>Ordinace</Text>
        <Text size="sm" c="dimmed">
          Seznam ordinací
        </Text>
        <Group justify="flex-end" mt="sm">
          <Button variant="default" size="xs">
            Zobrazit
          </Button>
        </Group>
      </Card>

      <Card withBorder shadow="sm">
        <Text fw={600}>Pacienti</Text>
        <Text size="sm" c="dimmed">
          Seznam pacientů
        </Text>
        <Group justify="flex-end" mt="sm">
          <Button variant="default" size="xs">
            Zobrazit
          </Button>
        </Group>
      </Card>

      <Card withBorder shadow="sm">
        <Text fw={600} c="green">
          + Nová schůzka
        </Text>
        <Text size="sm" c="dimmed">
          Přidat záznam
        </Text>
        <Group justify="flex-end" mt="sm">
          <Button variant="filled" color="green" size="xs">
            Přidat
          </Button>
        </Group>
      </Card>
    </SimpleGrid>
  );
};
