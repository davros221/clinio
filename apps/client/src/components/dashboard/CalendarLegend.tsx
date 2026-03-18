import { Group, Badge } from "@mantine/core";
import { ROOM_COLORS } from "./types";

export const CalendarLegend = () => (
  <Group gap="xs">
    {Object.entries(ROOM_COLORS).map(([name, colors]) => (
      <Badge
        key={name}
        size="sm"
        radius="sm"
        style={{ background: colors.bg, color: colors.text }}
      >
        {name}
      </Badge>
    ))}
  </Group>
);
