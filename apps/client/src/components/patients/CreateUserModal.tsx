import { Modal, TextInput, Button, Stack, Select, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { z } from "zod";
import { zodI18nResolver } from "../../i18n/zodI18nResolver";
import { UserRole, passwordRegex } from "@clinio/shared";
import {
  useCreatePatientMutation,
  useCreateStaffMutation,
} from "../../api/userService";
import { useT } from "../../hooks/useT";

const today = () => new Date().toISOString().slice(0, 10);

const baseSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
});

const patientSchema = baseSchema.extend({
  birthNumber: z.string().length(10, "common.validation.birthNumberLength"),
  birthdate: z
    .string()
    .min(1)
    .refine((v) => v <= today(), "common.validation.dateFuture"),
  phone: z.string().check(z.regex(/^\+420\d{9}$/, "common.validation.phone")),
});

const staffSchema = baseSchema.extend({
  role: z.enum([UserRole.DOCTOR, UserRole.NURSE]),
  password: z
    .string()
    .min(1)
    .check(z.regex(passwordRegex, { message: "signUp.passwordError" })),
});

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  birthNumber: string;
  birthdate: string;
  phone: string;
  role: typeof UserRole.DOCTOR | typeof UserRole.NURSE;
  password: string;
};

const initialValues: FormValues = {
  firstName: "",
  lastName: "",
  email: "",
  birthNumber: "",
  birthdate: "",
  phone: "",
  role: UserRole.DOCTOR,
  password: "",
};

type Props = {
  opened: boolean;
  onClose: () => void;
  mode: "patient" | "staff";
};

export function CreateUserModal({ opened, onClose, mode }: Props) {
  const t = useT();
  const isPatient = mode === "patient";

  const patientMutation = useCreatePatientMutation();
  const staffMutation = useCreateStaffMutation();
  const { isPending } = isPatient ? patientMutation : staffMutation;

  const form = useForm<FormValues>({
    initialValues,
    validate: zodI18nResolver(isPatient ? patientSchema : staffSchema),
  });

  const handleSubmit = (values: FormValues) => {
    if (isPatient) {
      patientMutation.mutate(
        {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          birthNumber: values.birthNumber.trim(),
          birthdate: values.birthdate,
          phone: values.phone.trim(),
        },
        { onSuccess: handleClose }
      );
    } else {
      staffMutation.mutate(
        {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          role: values.role,
          password: values.password,
        },
        { onSuccess: handleClose }
      );
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t(isPatient ? "patient.form.title" : "user.form.title")}
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label={t("patient.form.firstName")}
            {...form.getInputProps("firstName")}
            required
          />
          <TextInput
            label={t("patient.form.lastName")}
            {...form.getInputProps("lastName")}
            required
          />
          <TextInput
            label={t("patient.form.email")}
            {...form.getInputProps("email")}
            required
          />

          {isPatient ? (
            <>
              <TextInput
                label={t("patient.form.birthNumber")}
                {...form.getInputProps("birthNumber")}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  form.setFieldValue("birthNumber", value);
                }}
                required
              />
              <TextInput
                type="date"
                label={t("patient.form.birthdate")}
                {...form.getInputProps("birthdate")}
                required
              />
              <TextInput
                label={t("patient.form.phone")}
                {...form.getInputProps("phone")}
                required
              />
            </>
          ) : (
            <>
              <Select
                label={t("user.form.role")}
                data={[UserRole.DOCTOR, UserRole.NURSE]}
                {...form.getInputProps("role")}
                required
              />
              <TextInput
                type="password"
                label={t("user.form.password")}
                {...form.getInputProps("password")}
                required
              />
            </>
          )}

          <Group justify="flex-end" mt="sm">
            <Button variant="outline" color="gray" onClick={handleClose}>
              {t("common.action.cancel")}
            </Button>
            <Button type="submit" loading={isPending}>
              {t(isPatient ? "patient.form.submit" : "user.form.submit")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
