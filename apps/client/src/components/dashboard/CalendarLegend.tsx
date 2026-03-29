import { Group, Badge } from "@mantine/core";
import { getRoomColor } from "../utils/types";
import { useT } from "../../hooks/useT";

// TODO: receive actual room list from props once offices/rooms are loaded from API
const LEGEND_COUNT = 4;

export const CalendarLegend = () => {
  const t = useT();
  return (
    <Group gap="xs">
      {Array.from({ length: LEGEND_COUNT }, (_, i) => {
        const colors = getRoomColor(i);
        return (
          <Badge
            key={i}
            size="sm"
            radius="sm"
            style={{ background: colors.bg, color: colors.text }}
          >
            {t("offices.label")} {i + 1}
          </Badge>
        );
      })}
    </Group>
  );
};
