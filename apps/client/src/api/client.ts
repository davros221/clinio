import { client } from "@clinio/api";
import { ROUTER_PATHS } from "../router/routes.ts";

client.setConfig({
  baseURL: import.meta.env.VITE_API_URL,
});

// Authentication Interceptors
client.instance.interceptors.request.use((config) => {
  // first there should be authentication call to get the accessToken and then add it to the header of the request
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken && config.headers)
    config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Response Interceptors
client.instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (!isLoginRequest) {
      // Server responded with 401 — clear the stale token and let the component handle it
      if (error.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }

      // No response at all (network crash, timeout) — last resort fallback to login
      if (!error.response && typeof window !== "undefined") {
        window.location.href = ROUTER_PATHS.LOGIN;
      }
    }

    console.error("error", error);

    return Promise.reject(error);
  }
);

export { client };
