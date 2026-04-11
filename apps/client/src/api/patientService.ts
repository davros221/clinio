import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User, UserService, CreateUserDto } from "@clinio/api";
import { t } from "../i18n";
import { notifySuccess, notifyError } from "../utils/notification";
import { patientKeys } from "./queryKeys";

export type CreatePatientDto = Omit<CreateUserDto, "role" | "password">;

export const useCreatePatientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, CreatePatientDto>({
    mutationFn: async (body) => {
      const { data } = await UserService.create({
        body: {
          ...body,
          role: "CLIENT",
        },
        throwOnError: true,
      });
      if (!data) throw new Error(t("common.error.noData"));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      notifySuccess("Done!", "Patient was successfully created.");
    },
    onError: (error) =>
      notifyError(t("common.error.createFailed"), error.message),
  });
};
