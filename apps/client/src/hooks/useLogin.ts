import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@clinio/api";
import {
  mapApiErrorToNotification,
  mapSystemErrorToNotification,
} from "../utils/notification.ts";
import { router } from "../router/router.tsx";
import { ROUTER_PATHS } from "../router/routes.ts";
import { useAuthStore } from "../stores/authStore.ts";

export const useLogin = () => {
  const { login, logout } = useAuthStore();

  const { mutate, isPending } = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      AuthService.login({ body: credentials, throwOnError: true }),

    onSuccess: async ({ data }) => {
      if (data?.accessToken) {
        login(data.accessToken, data.authData);
        await router.navigate(ROUTER_PATHS.HOME);
      }
    },

    onError: (error) => {
      if (error && typeof error === "object") mapApiErrorToNotification(error);
      else mapSystemErrorToNotification(error);

      logout();
    },
  });

  return {
    login: (email: string, password: string) => mutate({ email, password }),
    loading: isPending,
  };
};
