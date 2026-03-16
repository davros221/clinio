import { useMutation } from "@tanstack/react-query";
import { AuthService, LoginDto } from "@clinio/api";
import { handleError } from "../utils/notification.ts";
import { router } from "../router/router.tsx";
import { ROUTER_PATHS } from "../router/routes.ts";
import { useAuthStore } from "../stores/authStore.ts";

export const useLogin = () => {
  const { login, logout } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginDto) =>
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
};
