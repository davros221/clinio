import { Modal, Stack, Badge, Group, Text } from "@mantine/core";
import { Appointment, DAYS, getRoomColor } from "../utils/types";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { IoMdTime } from "react-icons/io";
import { useT } from "../../hooks/useT";

type Props = {
  appt: Appointment | null;
  onClose: () => void;
};

export const AppointmentModal = ({ appt, onClose }: Props) => {
  const t = useT();
  return (
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
              background: getRoomColor(appt.roomNumber).bg,
              color: getRoomColor(appt.roomNumber).text,
            }}
          >
            {appt.room}
          </Badge>

          <Group gap="xs">
            <IoCalendarNumberOutline />
            <Text size="sm">{DAYS[appt.day - 1]}</Text>
          </Group>

          <Group gap="xs">
            <IoMdTime />
            <Text size="sm">
              {t("appointments.start")}: {appt.start} ·{" "}
              {t("appointments.duration")}: {appt.duration}{" "}
              {t("appointments.minutes")}
            </Text>
          </Group>
        </Stack>
      )}
    </Modal>
  );
};
