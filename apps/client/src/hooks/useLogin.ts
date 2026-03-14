import { useState } from "react";
import { AuthService } from "@clinio/api";
import {
  mapApiErrorToNotification,
  mapSystemErrorToNotification,
} from "../utils/notification.ts";
import { router } from "../router/router.tsx";
import { ROUTER_PATHS } from "../router/routes.ts";
import { useAuthStore } from "../stores/authStore.ts";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuthStore();

  const loginUser = async (email: string, password: string) => {
    setLoading(true);

    try {
      const { data, error } = await AuthService.login({
        body: { email, password },
      });

      if (error && typeof error === "object") {
        mapApiErrorToNotification(error);
        logout();
        return;
      }

      if (data && data.accessToken) {
        login(data.accessToken, data.authData);
        await router.navigate(ROUTER_PATHS.HOME);
      }
    } catch (networkError) {
      mapSystemErrorToNotification(networkError);
      logout();
    } finally {
      setLoading(false);
    }
  };

  return { login: loginUser, loading };
};
