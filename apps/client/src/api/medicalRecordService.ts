import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateMedicalRecordDto,
  MedicalRecord,
  MedicalRecordService,
  UpdateMedicalRecordDto,
  type DeletePatientMedicalRecordData,
} from "@clinio/api";
import { t } from "../i18n";
import { notifySuccess } from "../utils/notification";
import { medicalRecordKeys } from "./queryKeys";

export const useGetPatientMedicalRecordsQuery = (patientId: string) => {
  return useQuery({
    queryKey: medicalRecordKeys.list({ patientId }),
    queryFn: async () => {
      const { data } = await MedicalRecordService.getPatientMedicalRecords({
        path: { patientId },
        query: { sortBy: "createdAt", sortOrder: "DESC" },
      });
      return data!.items;
    },
    enabled: !!patientId,
  });
};

export const useCreatePatientMedicalRecordMutation = (patientId: string) => {
  const queryClient = useQueryClient();

  return useMutation<MedicalRecord, unknown, CreateMedicalRecordDto>({
    mutationFn: async (body) => {
      const { data } = await MedicalRecordService.createPatientMedicalRecord({
        path: { patientId },
        body,
      });
      return data!;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: medicalRecordKeys.list({ patientId }),
      });
      notifySuccess(t("medicalRecord.notification.createSuccess"), "");
    },
  });
};

type UpdateMutationVars = {
  path: { patientId: string; id: string };
  body: UpdateMedicalRecordDto;
};

export const useUpdatePatientMedicalRecordMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<MedicalRecord, unknown, UpdateMutationVars>({
    mutationFn: async ({ path, body }) => {
      const { data } = await MedicalRecordService.updatePatientMedicalRecord({
        path,
        body,
      });
      return data!;
    },
    onSuccess: (_, { path }) => {
      void queryClient.invalidateQueries({
        queryKey: medicalRecordKeys.list({ patientId: path.patientId }),
      });
      notifySuccess(t("medicalRecord.notification.updateSuccess"), "");
    },
  });
};

export const useDeletePatientMedicalRecordMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    unknown,
    Pick<DeletePatientMedicalRecordData, "path">
  >({
    mutationFn: async ({ path }) => {
      await MedicalRecordService.deletePatientMedicalRecord({ path });
    },
    onSuccess: (_, { path }) => {
      void queryClient.invalidateQueries({
        queryKey: medicalRecordKeys.list({ patientId: path.patientId }),
      });
      notifySuccess(t("medicalRecord.notification.deleteSuccess"), "");
    },
  });
};
