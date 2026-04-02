import { useQuery } from "@tanstack/react-query";
import { AuthService } from "@clinio/api";
import { useAuthStore } from "../stores/authStore.ts";

export const useRefreshUser = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const login = useAuthStore((state) => state.login);

  useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await AuthService.me({ throwOnError: true });
      if (data?.authData && accessToken) {
        login(accessToken, data.authData);
      }
      return data;
    },
    enabled: !!accessToken,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
};
