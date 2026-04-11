import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User, UserService } from "@clinio/api";
import { t } from "../i18n";
import { notifyError } from "../utils/notification";
import { notifySuccess } from "../utils/notification";
import { patientKeys } from "./queryKeys";

export type CreatePatientDto = {
  firstName: string;
  lastName: string;
  email: string;
  birthNumber?: string;
  birthdate?: string;
  phone?: string;
};

export const useCreatePatientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, CreatePatientDto>({
    mutationFn: async (body) => {
      const { data } = await UserService.create({
        body: {
          ...body,
          role: "CLIENT",
        } as any,
        throwOnError: true,
      });
      if (!data) throw new Error(t("common.error.noData"));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      notifySuccess(
        t("patient.notification.createSuccessTitle"),
        t("patient.notification.createSuccessMessage")
      );
    },
    onError: (error) =>
      notifyError(t("common.error.createFailed"), error.message),
  });
};
