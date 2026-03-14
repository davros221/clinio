import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@clinio/api";
import { handleError } from "../utils/notification.ts";
import { router } from "../router/router.tsx";
import { ROUTER_PATHS } from "../router/routes.ts";
import { useAuthStore } from "../stores/authStore.ts";

export const useLogin = () => {
  const { login, logout } = useAuthStore();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      AuthService.login({ body: credentials, throwOnError: true }),

    onSuccess: async ({ data }) => {
      if (data?.accessToken) {
        login(data.accessToken, data.authData);
        await router.navigate(ROUTER_PATHS.HOME);
      }
    },

    onError: (error: unknown) => {
      handleError(error);
      logout();
    },
  });

  return {
    login: (email: string, password: string) =>
      mutateAsync({ email, password }),
    loading: isPending,
  };
};
