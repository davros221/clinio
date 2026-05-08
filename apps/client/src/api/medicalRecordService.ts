import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateMedicalRecordDto,
  MedicalRecord,
  MedicalRecordService,
  UpdateMedicalRecordDto,
  type DeletePatientMedicalRecordData,
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

type UpdateMutationVars = {
  path: { patientId: string; id: string };
  body: UpdateMedicalRecordDto;
};

export const useUpdatePatientMedicalRecordMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<MedicalRecord, Error, UpdateMutationVars>({
    mutationFn: async ({ path, body }) => {
      const { data } = await MedicalRecordService.updatePatientMedicalRecord({
        path,
        body,
      });
      if (!data) throw new Error(t("common.error.noData"));
      return data;
    },
    onSuccess: (_, { path }) => {
      queryClient.invalidateQueries({
        queryKey: medicalRecordKeys.list({ patientId: path.patientId }),
      });
      notifySuccess(t("medicalRecord.notification.updateSuccess"), "");
    },
    onError: (error) =>
      notifyError(t("common.error.updateFailed"), error.message),
  });
};

export const useDeletePatientMedicalRecordMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Pick<DeletePatientMedicalRecordData, "path">>(
    {
      mutationFn: async ({ path }) => {
        await MedicalRecordService.deletePatientMedicalRecord({
          path,
        });
      },
      onSuccess: (_, { path }) => {
        queryClient.invalidateQueries({
          queryKey: medicalRecordKeys.list({ patientId: path.patientId }),
        });
        notifySuccess(t("medicalRecord.notification.deleteSuccess"), "");
      },
      onError: (error) =>
        notifyError(t("common.error.deleteFailed"), error.message),
    }
  );
};
