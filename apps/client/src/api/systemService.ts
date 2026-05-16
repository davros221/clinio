import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { SystemService } from "@clinio/api";
import { AuthToken } from "@utils";

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

export const useShutdownMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (password: string) => {
      await SystemService.shutdown({
        body: { password },
        throwOnError: true,
      });
    },
    onSuccess: () => {
      AuthToken.clear();
      queryClient.clear();
    },
    throwOnError: false,
    meta: {
      skipGlobalErrorHandler: true,
    },
  });
};
