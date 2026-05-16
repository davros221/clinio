import {
  keepPreviousData,
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { handleError } from "@utils";

export const queryClient = new QueryClient({
  // config
  defaultOptions: {
    queries: {
      throwOnError: true,
      placeholderData: keepPreviousData,
    },
    mutations: {
      throwOnError: true,
    },
  },

  // query chahe config
  queryCache: new QueryCache({
    onError: (error) => {
      handleError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      handleError(error);
    },
  }),
});
