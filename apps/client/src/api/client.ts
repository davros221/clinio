import { client } from "@clinio/api";
import { ROUTER_PATHS } from "../router/routes.ts";

client.setConfig({
  baseURL: import.meta.env.VITE_API_URL,
});

// Authentication Interceptors
client.instance.interceptors.request.use((config) => {
  // ToDo: Add request interceptors here
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
    // if unauthorized
    if (error.response && error.response.status === 401) {
      // Clear invalid token
      localStorage.removeItem("accessToken");

      if (typeof window !== "undefined") {
        // window.location.href enforces the hard refresh of the page to reset the data
        window.location.href = ROUTER_PATHS.LOGIN;
      }
    }

    return Promise.reject(error);
  }
);

export { client };
