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
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useMemo, useState } from "react";
import { z } from "zod";
import {
  AppointmentStatus,
  createAppointmentSchema,
  DAYS,
} from "@clinio/shared";
import { OfficeHoursTemplateDto } from "@clinio/api";
import { useT, useUserRole } from "@hooks";
import { DateUtils } from "@utils";
import {
  useCreateAppointmentMutation,
  useGetAppointmentListQuery,
  useGetOfficeListQuery,
  useGetPatientsQuery,
} from "@api";

const formSchema = createAppointmentSchema.omit({ status: true }).extend({
  officeId: createAppointmentSchema.shape.officeId.nullable(),
  hour: z.preprocess(
    (v) => (v === null ? undefined : v),
    createAppointmentSchema.shape.hour
  ),
});

function getHoursForDate(
  officeHoursTemplate: OfficeHoursTemplateDto | null,
  date: string
): number[] {
  if (!officeHoursTemplate || !date) return [];
  const dayName = DAYS[DateUtils.isoWeekday(date)];
  const intervals = officeHoursTemplate[dayName] ?? [];
  const hours: number[] = [];
  for (const { from, to } of intervals) {
    for (let h = from; h < to; h++) {
      hours.push(h);
    }
  }
  return hours;
}

type FormValues = Omit<z.infer<typeof formSchema>, "hour"> & {
  hour: number | null;
};

type Props = {
  opened: boolean;
  onClose: () => void;
};

export function CreateAppointmentModal({ opened, onClose }: Props) {
  const t = useT();
  const { isStaff } = useUserRole();
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { mutate: createAppointment, isPending } =
    useCreateAppointmentMutation();
  const { data: offices = [] } = useGetOfficeListQuery();
  const { data: patients = [] } = useGetPatientsQuery(isStaff);

  const form = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      officeId: null,
      patientId: null,
      date: "",
      hour: null,
      note: "",
    },
    validate: zod4Resolver(
      (isStaff
        ? formSchema.refine((d) => !!d.patientId, {
            path: ["patientId"],
            message: t("common.validation.required"),
          })
        : formSchema.refine(
            (d) => !d.date || d.date >= new Date().toISOString().slice(0, 10),
            { path: ["date"], message: t("common.validation.datePast") }
          )
      ).refine((d) => !!d.officeId, {
        path: ["officeId"],
        message: t("common.validation.required"),
      })
    ),
  });

  const officeSelectData = offices.map((o) => ({ value: o.id, label: o.name }));

  const patientSelectData = patients.map((p) => ({
    value: p.id,
    label: `${p.firstName} ${p.lastName}`,
  }));

  const { data: officeAppointments = [] } = useGetAppointmentListQuery(
    selectedOfficeId ? { officeId: selectedOfficeId } : undefined,
    !!selectedOfficeId
  );

  const availableHours = useMemo(() => {
    if (!selectedOfficeId || !selectedDate) return [];
    const selectedOffice = offices.find((o) => o.id === selectedOfficeId);
    if (!selectedOffice) return [];

    const hours = getHoursForDate(
      selectedOffice.officeHoursTemplate,
      selectedDate
    );

    const bookedHours = new Set(
      officeAppointments
        .filter((a) => a.date === selectedDate)
        .map((a) => a.hour)
    );

    return hours
      .filter((h) => !bookedHours.has(h))
      .map((h) => ({ value: String(h), label: `${h}:00` }));
  }, [selectedOfficeId, selectedDate, offices, officeAppointments]);

  const handleOfficeOrDateChange = () => {
    form.setFieldValue("hour", null);
  };

  const handleSubmit = (values: FormValues) => {
    createAppointment(
      {
        officeId: values.officeId!,
        patientId: values.patientId,
        date: values.date,
        hour: values.hour!,
        status: AppointmentStatus.PLANNED,
        note: values.note,
      },
      {
        onSuccess: () => {
          form.reset();
          setSelectedOfficeId(null);
          setSelectedDate(null);
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    form.reset();
    setSelectedOfficeId(null);
    setSelectedDate(null);
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
              setSelectedOfficeId(v);
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
              setSelectedDate(e.currentTarget.value || null);
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
