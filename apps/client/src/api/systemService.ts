import { queryOptions, useQuery } from "@tanstack/react-query";
import { SystemService } from "@clinio/api";

export const systemKeys = {
  status: ["system", "status"] as const,
};

const getAppStatusQueryOptions = queryOptions({
  queryKey: systemKeys.status,
  queryFn: async () => {
    const res = await SystemService.getAppStatus();
    return res.data;
  },
  staleTime: Infinity,
});

export const useGetAppStatusQuery = (enabled = true) => {
  return useQuery({ ...getAppStatusQueryOptions, enabled });
};
