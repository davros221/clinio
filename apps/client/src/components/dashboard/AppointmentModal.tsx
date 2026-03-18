import { Modal, Stack, Badge, Group, Text } from "@mantine/core";
import { Appointment, DAYS, ROOM_COLORS } from "./types";

type Props = {
  appt: Appointment | null;
  onClose: () => void;
};

export const AppointmentModal = ({ appt, onClose }: Props) => (
  <Modal
    opened={appt !== null}
    onClose={onClose}
    title={
      <Text fw={600} size="md">
        {appt?.patientName}
      </Text>
    }
    centered
    size="sm"
  >
    {appt && (
      <Stack gap="sm">
        <Badge
          size="md"
          radius="sm"
          style={{
            //fallback colors if room is not defined in ROOM_COLORS
            background: ROOM_COLORS[appt.room]?.bg ?? "#eee",
            color: ROOM_COLORS[appt.room]?.text ?? "#333",
          }}
        >
          {appt.room}
        </Badge>

        <Group gap="xs">
          <Text size="sm">📅</Text>
          <Text size="sm">{DAYS[appt.day - 1]}</Text>
        </Group>

        <Group gap="xs">
          <Text size="sm">🕐</Text>
          <Text size="sm">
            {appt.start} — délka: {appt.duration} min
          </Text>
        </Group>
      </Stack>
    )}
  </Modal>
);
