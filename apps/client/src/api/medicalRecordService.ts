import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateMedicalRecordDto,
  MedicalRecord,
  MedicalRecordService,
} from "@clinio/api";
import { t } from "../i18n";
import { notifyError, notifySuccess } from "../utils/notification";
import { medicalRecordKeys } from "./queryKeys";

export const useGetPatientMedicalRecordsQuery = (patientId: string) => {
  return useQuery({
    queryKey: medicalRecordKeys.list({ patientId }),
    queryFn: async () => {
      const res = await MedicalRecordService.getPatientMedicalRecords({
        path: { patientId },
        query: { sortBy: "createdAt", sortOrder: "DESC" },
      });
      return res.data?.items ?? [];
    },
    enabled: !!patientId,
  });
};

export const useCreatePatientMedicalRecordMutation = (patientId: string) => {
  const queryClient = useQueryClient();

  return useMutation<MedicalRecord, Error, CreateMedicalRecordDto>({
    mutationFn: async (body) => {
      const { data } = await MedicalRecordService.createPatientMedicalRecord({
        path: { patientId },
        body,
        throwOnError: true,
      });
      if (!data) throw new Error(t("common.error.noData"));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: medicalRecordKeys.list({ patientId }),
      });
      notifySuccess(t("medicalRecord.notification.createSuccess"), "");
    },
    onError: (error) =>
      notifyError(t("common.error.createFailed"), error.message),
  });
};
