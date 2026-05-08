import { useState, useEffect } from "react";
import {
  Modal,
  Stack,
  Badge,
  Group,
  Text,
  Button,
  Select,
  Textarea,
  Divider,
} from "@mantine/core";
import { useNavigate } from "react-router";
import { CalendarSlot, CAP_WORK_DAYS } from "../utils/types";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { IoMdTime } from "react-icons/io";
import { GoNote } from "react-icons/go";
import {
  useDeleteAppointmentMutation,
  useUpdateAppointmentMutation,
  useCancelAppointmentMutation,
} from "../../api";
import { t } from "../../i18n";
import { useUserRole } from "../../hooks/useUserRole";
import { openConfirmModal } from "../../utils";
import { APPOINTMENT_STATUS_COLOR } from "../../utils";
import { AppointmentStatus } from "@clinio/shared";

type Props = {
  appt: CalendarSlot | null;
  onClose: () => void;
};

export const AppointmentModal = ({ appt, onClose }: Props) => {
  const { isStaff } = useUserRole();
  const navigate = useNavigate();
  const { mutate: deleteAppointment } = useDeleteAppointmentMutation();
  const { mutate: updateAppointment, isPending } =
    useUpdateAppointmentMutation();
  const { mutate: cancelAppointment, isPending: isCancelling } =
    useCancelAppointmentMutation();

  const [newStatus, setNewStatus] = useState<AppointmentStatus | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (appt) {
      setNewStatus(null);
      setNote(appt.note ?? "");
    }
  }, [appt]);

  const isPlanned = appt?.status === AppointmentStatus.PLANNED;

  const statusLabel: Record<AppointmentStatus, string> = {
    [AppointmentStatus.PLANNED]: t("appointment.status.planned"),
    [AppointmentStatus.COMPLETED]: t("appointment.status.completed"),
    [AppointmentStatus.CANCELLED]: t("appointment.status.cancelled"),
  };

  const handleDelete = () => {
    if (!appt) return;
    openConfirmModal({
      onConfirm: () => deleteAppointment(appt.id, { onSuccess: onClose }),
    });
  };

  const handleSave = () => {
    if (!appt) return;
    updateAppointment(
      { id: appt.id, dto: { status: newStatus ?? undefined, note } },
      { onSuccess: onClose }
    );
  };

  const statusOptions = [
    {
      value: AppointmentStatus.PLANNED,
      label: t("appointment.status.planned"),
    },
    {
      value: AppointmentStatus.COMPLETED,
      label: t("appointment.status.completed"),
    },
    {
      value: AppointmentStatus.CANCELLED,
      label: t("appointment.status.cancelled"),
    },
  ];

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
          <Group gap="xs">
            <Badge size="md" radius="sm">
              {appt.room}
            </Badge>
            <Badge
              size="md"
              radius="sm"
              color={APPOINTMENT_STATUS_COLOR[appt.status]}
            >
              {statusLabel[appt.status]}
            </Badge>
          </Group>

          <Group gap="xs">
            <IoCalendarNumberOutline />
            <Text size="sm">{CAP_WORK_DAYS[appt.day - 1]}</Text>
          </Group>

          <Group gap="xs">
            <IoMdTime />
            <Text size="sm">
              {appt.start} — {t("appointment.durationLabel")}: {appt.duration}{" "}
              min
            </Text>
          </Group>

          {appt.note && !isStaff && (
            <Group gap="xs">
              <GoNote />
              <Text size="sm" c="dimmed">
                {appt.note}
              </Text>
            </Group>
          )}

          {isStaff && isPlanned && (
            <>
              <Divider />

              <Select
                label={t("appointment.overview.table.status")}
                placeholder={t("appointment.status.planned")}
                data={statusOptions}
                value={newStatus}
                onChange={(v) => setNewStatus(v as AppointmentStatus | null)}
                clearable
              />

              <Textarea
                label={t("appointment.createModal.fields.note")}
                placeholder={t(
                  "appointment.createModal.fields.notePlaceholder"
                )}
                value={note}
                onChange={(e) => setNote(e.currentTarget.value)}
                autosize
                minRows={2}
              />

              <Button onClick={handleSave} loading={isPending}>
                {t("common.action.save")}
              </Button>

              <Divider />
            </>
          )}

          {isStaff && appt.note && !isPlanned && (
            <>
              <Divider />
              <Group gap="xs">
                <GoNote />
                <Text size="sm" c="dimmed">
                  {appt.note}
                </Text>
              </Group>
            </>
          )}

          {isStaff && appt.patientId && (
            <Button
              variant="light"
              onClick={() => {
                onClose();
                navigate(`/patients/${appt.patientId}`);
              }}
            >
              {t("patient.overview.detail")}
            </Button>
          )}

          {!isStaff && isPlanned && (
            <Button
              color="red"
              variant="light"
              loading={isCancelling}
              onClick={() =>
                appt && cancelAppointment(appt.id, { onSuccess: onClose })
              }
            >
              {t("common.action.cancel")}
            </Button>
          )}

          {isStaff && isPlanned && (
            <Button color="red" variant="light" onClick={handleDelete}>
              {t("common.action.delete")}
            </Button>
          )}
        </Stack>
      )}
    </Modal>
  );
};
