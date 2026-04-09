import { Modal, Stack, Badge, Group, Text } from "@mantine/core";
import { Appointment, CAP_WORK_DAYS, ROOM_COLORS } from "../utils/types";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { IoMdTime } from "react-icons/io";

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
            background:
              ROOM_COLORS[appt.room]?.bg ?? "var(--mantine-color-gray-5)",
            color: ROOM_COLORS[appt.room]?.text ?? "var(--mantine-color-white)",
          }}
        >
          {appt.room}
        </Badge>

        <Group gap="xs">
          <IoCalendarNumberOutline />
          <Text size="sm">{CAP_WORK_DAYS[appt.day - 1]}</Text>
        </Group>

        <Group gap="xs">
          <IoMdTime />
          <Text size="sm">
            {appt.start} — délka: {appt.duration} min
          </Text>
        </Group>
      </Stack>
    )}
  </Modal>
);
