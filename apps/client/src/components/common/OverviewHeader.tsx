import { ReactNode } from "react";
import { Group, Paper, Title } from "@mantine/core";

type Props = {
  title: string;
  action?: ReactNode;
};

export function OverviewHeader({ title, action }: Props) {
  return (
    <Paper p="lg" radius="md" shadow="sm" withBorder>
      <Group justify="space-between" wrap="wrap">
        <Title order={2}>{title}</Title>
        {action}
      </Group>
    </Paper>
  );
}
