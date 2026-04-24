import { Modal, Stack, Badge, Group, Text, Button } from "@mantine/core";
import { useNavigate } from "react-router";
import { CalendarSlot, CAP_WORK_DAYS } from "../utils/types";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { IoMdTime } from "react-icons/io";
import { GoNote } from "react-icons/go";
import { useDeleteAppointmentMutation } from "../../api";
import { t } from "../../i18n";
import { useUserRole } from "../../hooks/useUserRole";
import { openConfirmModal } from "../../utils";

type Props = {
  appt: CalendarSlot | null;
  onClose: () => void;
};

export const AppointmentModal = ({ appt, onClose }: Props) => {
  const { isStaff } = useUserRole();
  const navigate = useNavigate();
  const { mutate: deleteAppointment } = useDeleteAppointmentMutation();

  const handleDelete = () => {
    if (!appt) return;
    openConfirmModal({
      onConfirm: () => deleteAppointment(appt.id, { onSuccess: onClose }),
    });
  };

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

          {appt.note && (
            <Group gap="xs">
              <GoNote />
              <Text size="sm" c="dimmed">
                {appt.note}
              </Text>
            </Group>
          )}

          {isStaff && appt.patientId && (
            <Button
              variant="light"
              mt="xs"
              onClick={() => {
                onClose();
                navigate(`/patients/${appt.patientId}`);
              }}
            >
              {t("patient.overview.detail")}
            </Button>
          )}

          {isStaff && (
            <Button color="red" variant="light" onClick={handleDelete}>
              {t("common.action.delete")}
            </Button>
          )}
        </Stack>
      )}
    </Modal>
  );
};
