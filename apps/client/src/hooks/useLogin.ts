import { useState } from "react";
import { AuthService } from "@clinio/api";
import {
  mapApiErrorToNotification,
  mapSystemErrorToNotification,
} from "../utils/notification.ts";
import { router } from "../router/router.tsx";
import { ROUTER_PATHS } from "../router/routes.ts";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);

    const clearStaleSession = () => {
      if (localStorage.getItem("accessToken")) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    };

    try {
      const { data, error } = await AuthService.login({
        body: { email, password },
      });

      if (error && typeof error === "object") {
        mapApiErrorToNotification(error);
        clearStaleSession();
        return;
      }

      if (data && data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.authData));
        await router.navigate(ROUTER_PATHS.HOME);
      }
    } catch (networkError) {
      mapSystemErrorToNotification(networkError);
      clearStaleSession();
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
};
