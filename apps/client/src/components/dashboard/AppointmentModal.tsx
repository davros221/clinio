import { Modal, Stack, Badge, Group, Text } from "@mantine/core";
import { CalendarSlot, CAP_WORK_DAYS } from "../utils/types";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { IoMdTime } from "react-icons/io";

type Props = {
  appt: CalendarSlot | null;
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
        <Badge size="md" radius="sm">
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
