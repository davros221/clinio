import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { PatientService } from "@clinio/api";
import { patientKeys } from "./queryKeys.ts";

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
        // ToDo: Add search params when refactoring the table
        query: {
          limit: params?.limit,
          page: params?.page,
          search: params?.search,
        },
        signal,
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 3,
    queryKey: patientKeys.list(params),
    placeholderData: keepPreviousData,
  });

export const useGetPatientList = (params?: GetPatientListParams) => {
  return useQuery(getPatientListOptions(params));
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
