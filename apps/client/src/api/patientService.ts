import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { PatientService, UpdatePatientDto } from "@clinio/api";
import { authKeys, patientKeys } from "./queryKeys.ts";

// ToDO: Gen from swagger def
type GetPatientListParams = {
  limit?: number;
  page?: number;
  search?: string;
};

const getPatientListOptions = (params?: GetPatientListParams) =>
  queryOptions({
    queryFn: async ({ signal }) => {
      const res = await PatientService.getPatients({
        query: {
          limit: params?.limit,
          page: params?.page,
          search: params?.search,
        },
        signal,
        throwOnError: true,
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 3,
    queryKey: patientKeys.list(params),
  });

export const useGetPatientList = (
  params?: GetPatientListParams,
  enabled = true
) => {
  return useQuery({ ...getPatientListOptions(params), enabled });
};

const getPatientDetailOptions = (id: string) =>
  queryOptions({
    queryFn: async ({ signal }) => {
      const res = await PatientService.getPatientById({
        path: { id },
        signal,
      });
      return res.data;
    },
    queryKey: patientKeys.detail(id),
  });

export const useGetPatientDetailQuery = (id: string) => {
  return useQuery(getPatientDetailOptions(id));
};

export const useUpdatePatientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; body: UpdatePatientDto }) => {
      const res = await PatientService.updatePatient({
        path: { id: data.id },
        body: data.body,
      });
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [authKeys.me] });
      void queryClient.invalidateQueries({ queryKey: patientKeys.all });
    },
  });
};

export const useDeletePatientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await PatientService.deletePatient({
        path: { id },
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: patientKeys.all });
    },
    onError: (e) => {
      handleError(e);
    },
  });
};
