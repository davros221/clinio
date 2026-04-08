import {
  Modal,
  Stack,
  Select,
  Textarea,
  Button,
  Group,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMemo } from "react";
import { z } from "zod";
import {
  AppointmentStatus,
  UserRole,
  createAppointmentSchema,
  days,
} from "@clinio/shared";

const formSchema = createAppointmentSchema.omit({ status: true }).extend({
  officeId: createAppointmentSchema.shape.officeId.nullable(),
  hour: createAppointmentSchema.shape.hour.nullable(),
});
import { OfficeHoursTemplateDto } from "@clinio/api";
import { useCreateAppointmentMutation } from "../../api/appointmentService";
import { useGetOfficeListQuery } from "../../api/officeService";
import { useGetUsersQuery } from "../../api/userService";
import { useUser } from "../../hooks/useUser";
import { useT } from "../../hooks/useT";

function getHoursForDate(
  officeHoursTemplate: OfficeHoursTemplateDto | null,
  date: string
): number[] {
  if (!officeHoursTemplate || !date) return [];
  const [year, month, day] = date.split("-").map(Number);
  const dayName = days[(new Date(year, month - 1, day).getDay() + 6) % 7];
  const intervals = officeHoursTemplate[dayName] ?? [];
  const hours: number[] = [];
  for (const { from, to } of intervals) {
    for (let h = from; h < to; h++) {
      hours.push(h);
    }
  }
  return hours;
}

type FormValues = z.infer<typeof formSchema>;

type Props = {
  opened: boolean;
  onClose: () => void;
};

export function CreateAppointmentModal({ opened, onClose }: Props) {
  const t = useT();
  const user = useUser();
  const isStaff =
    user?.role === UserRole.NURSE || user?.role === UserRole.DOCTOR;

  const { mutate: createAppointment, isPending } =
    useCreateAppointmentMutation();
  const { data: offices = [] } = useGetOfficeListQuery();
  const { data: clientUsers = [] } = useGetUsersQuery(
    [UserRole.CLIENT],
    isStaff
  );

  const form = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      officeId: null,
      patientId: null,
      date: "",
      hour: null,
      note: "",
    },
    validate: (values) => {
      const schemaResult = createAppointmentSchema.safeParse({
        ...values,
        hour: values.hour ?? undefined,
        status: AppointmentStatus.PLANNED,
      });

      const errors: Record<string, string> = {};
      if (!schemaResult.success) {
        for (const issue of schemaResult.error.issues) {
          const key = String(issue.path[0]);
          if (key && !errors[key]) errors[key] = issue.message;
        }
      }

      if (isStaff && !values.patientId) {
        errors.patientId = t("common.validation.required");
      }

      return errors;
    },
  });

  const officeSelectData = offices.map((o) => ({ value: o.id, label: o.name }));

  const patientSelectData = clientUsers.map((u) => ({
    value: u.id,
    label: `${u.firstName} ${u.lastName}`,
  }));

  const availableHours = useMemo(() => {
    const values = form.getValues();
    const selectedOffice = offices.find((o) => o.id === values.officeId);
    if (!selectedOffice) return [];
    const hours = getHoursForDate(
      selectedOffice.officeHoursTemplate,
      values.date
    );
    return hours.map((h) => ({ value: String(h), label: `${h}:00` }));
  }, [form.getValues().officeId, form.getValues().date, offices]);

  const handleOfficeOrDateChange = () => {
    form.setFieldValue("hour", null);
  };

  const handleSubmit = (values: FormValues) => {
    createAppointment(
      {
        officeId: values.officeId ?? null,
        patientId: values.patientId ?? null,
        date: values.date,
        hour: values.hour!,
        status: AppointmentStatus.PLANNED,
        note: values.note,
      },
      {
        onSuccess: () => {
          form.reset();
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t("appointment.createModal.title")}
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <Select
            key={form.key("officeId")}
            label={t("appointment.createModal.fields.office")}
            placeholder={t("appointment.createModal.fields.officePlaceholder")}
            data={officeSelectData}
            searchable
            {...form.getInputProps("officeId")}
            onChange={(v) => {
              form.getInputProps("officeId").onChange(v);
              handleOfficeOrDateChange();
            }}
          />

          {isStaff && (
            <Select
              key={form.key("patientId")}
              label={t("appointment.createModal.fields.patient")}
              placeholder={t(
                "appointment.createModal.fields.patientPlaceholder"
              )}
              data={patientSelectData}
              searchable
              clearable
              {...form.getInputProps("patientId")}
            />
          )}

          <TextInput
            key={form.key("date")}
            type="date"
            label={t("appointment.createModal.fields.date")}
            {...form.getInputProps("date")}
            onChange={(e) => {
              form.getInputProps("date").onChange(e.currentTarget.value);
              handleOfficeOrDateChange();
            }}
          />

          <Select
            key={form.key("hour")}
            label={t("appointment.createModal.fields.time")}
            placeholder={t("appointment.createModal.fields.timePlaceholder")}
            data={availableHours}
            disabled={availableHours.length === 0}
            {...form.getInputProps("hour")}
            value={
              form.getValues().hour !== null
                ? String(form.getValues().hour)
                : null
            }
            onChange={(v) =>
              form.setFieldValue("hour", v !== null ? Number(v) : null)
            }
          />

          <Textarea
            key={form.key("note")}
            label={t("appointment.createModal.fields.note")}
            placeholder={t("appointment.createModal.fields.notePlaceholder")}
            autosize
            minRows={3}
            {...form.getInputProps("note")}
          />

          <Group justify="flex-end" mt="sm">
            <Button variant="outline" color="gray" onClick={handleClose}>
              {t("appointment.createModal.buttons.cancel")}
            </Button>
            <Button type="submit" loading={isPending}>
              {t("appointment.createModal.buttons.submit")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
