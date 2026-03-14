import { client } from "@clinio/api";
import { useAuthStore } from "../stores/authStore.ts";

client.setConfig({
  baseURL: import.meta.env.VITE_API_URL,
});

// Authentication Interceptors
client.instance.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

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
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
      }
    }

    console.error("error", error);

    return Promise.reject(error);
  }
);

export { client };
