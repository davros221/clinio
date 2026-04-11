import { client } from "@clinio/api";

client.setConfig({
  baseURL: import.meta.env.VITE_API_URL,
});

// Authentication Interceptors
client.instance.interceptors.request.use((config) => {
  // const accessToken = useAuthStore.getState().accessToken;
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

    // ToDo: Nuke query data
    if (!isLoginRequest) {
      if (error.response?.status === 401) {
        // useAuthStore.getState().logout();
        localStorage.removeItem("accessToken");
      }
    }

    console.error("error", error);

    return Promise.reject(error);
  }
);

export { client };
