import { client } from "@clinio/api";
import { AuthToken } from "@utils";

client.setConfig({
  baseURL: import.meta.env.VITE_API_URL,
});

// Authentication Interceptors
client.instance.interceptors.request.use((config) => {
  const accessToken = AuthToken.get();

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
        // ToDo: We should nuke query data
        AuthToken.clear();
      }
    }

    console.error("error", error);

    return Promise.reject(error);
  }
);

export { client };
