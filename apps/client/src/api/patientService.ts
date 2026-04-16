import { useQuery } from "@tanstack/react-query";
import { Patient, PatientService } from "@clinio/api";

const patientKeys = {
  list: ["patients", "list"] as const,
};

export const useGetPatientsQuery = (enabled = true) => {
  return useQuery<Patient[]>({
    queryKey: patientKeys.list,
    enabled,
    queryFn: async () => {
      const { data } = await PatientService.getPatients({ throwOnError: true });
      return data?.items ?? [];
    },
  });
};
