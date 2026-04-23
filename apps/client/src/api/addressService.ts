import { AddressService, SuggestItem } from "@clinio/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { addressKeys, suggestKeys } from "./queryKeys.ts";

export const useAddressSuggestQuery = (query: string) => {
  return useQuery<SuggestItem[]>({
    queryKey: [addressKeys.list(), suggestKeys.list(), query],
    queryFn: async () => {
      const { data } = await AddressService.suggestAddress({
        query: { query },
        throwOnError: true,
      });
      return data?.items ?? [];
    },
    enabled: query.length >= 3,
    placeholderData: keepPreviousData,
  });
};
