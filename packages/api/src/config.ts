import type { Config, ClientOptions } from "./generated/client/index.js";

export const createClientConfig = <T extends ClientOptions>(
  override?: Config<T>
): Config<T> => ({
  ...override,
  baseURL: override?.baseURL ?? "http://localhost:8000",
});
