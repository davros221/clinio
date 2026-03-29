import { useQuery } from "@tanstack/react-query";
import { OfficeService, Office } from "@clinio/api";

// TODO: export interface GetOfficesParams {}
// extend with filter params (specialization...) -> export const useGetOfficesQuery = (params?: GetOfficesParams)
export const useGetOfficesQuery = () => {
  return useQuery<Office[]>({
    queryKey: ["offices"],
    queryFn: async () => {
      const { data } = await OfficeService.getOffices({ throwOnError: true });
      return data ?? [];
    },
  });
};
