import { client } from "@clinio/api";

client.setConfig({
  baseURL: import.meta.env.VITE_API_URL,
});

client.instance.interceptors.request.use((config) => {
  // ToDo: Add request interceptors here
  return config;
});

client.instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // ToDo: Add response interceptors here

    return Promise.reject(error);
  }
);
