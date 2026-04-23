import { useForm, schemaResolver } from "@mantine/form";
import { z } from "zod";
import { isValidBirthNumber } from "@clinio/shared";
import { useT, useUser } from "@hooks";
import { useUpdatePatientMutation } from "@api";
import { useNavigate } from "react-router";
import { ROUTER_PATHS } from "@router";

export const useSettingsPage = () => {
  const t = useT();

  const schema = z.object({
    birthNumber: z
      .string()
      .min(1, t("common.validation.required"))
      .refine(isValidBirthNumber, {
        message: t("common.validation.invalidBirthNumber"),
      }),
    birthdate: z.string().min(1, t("common.validation.required")),
    phone: z
      .string()
      .min(1, t("common.validation.required"))
      .regex(/^\+\d{7,15}$/, t("common.validation.phone")),
  });

  const { user } = useUser();
  const navigate = useNavigate();
  const { mutate: updatePatient, isPending } = useUpdatePatientMutation();

  const patient = user?.patient;
  // Generated AuthPatient types are { [key: string]: unknown } due to missing Swagger annotations on BE
  const birthNumber = String(patient?.birthNumber ?? "");
  const birthdate = String(patient?.birthdate ?? "");
  const phone = String(patient?.phone ?? "");

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      birthNumber,
      birthdate: birthdate
        ? new Date(birthdate).toISOString().split("T")[0]
        : "",
      phone,
    },
    validate: schemaResolver(schema),
  });

  const handleSubmit = form.onSubmit((data) => {
    if (!patient?.id) return;
    updatePatient(
      {
        id: patient.id,
        body: data as { birthNumber: string; birthdate: string; phone: string },
      },
      {
        onSuccess: () => {
          navigate(ROUTER_PATHS.HOME, { replace: true });
        },
      }
    );
  });

  return { form, handleSubmit, isPending };
};
