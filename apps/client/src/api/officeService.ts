import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateOfficeDto,
  Office,
  OfficeService,
  type UpdateOfficeData,
  type DeleteOfficeData,
} from "@clinio/api";
import { officeKeys } from "./queryKeys";

type GetOfficeListParams = {
  page?: number;
  limit?: number;
};

export const useGetOfficeListQuery = (params?: GetOfficeListParams) => {
  return useQuery({
    queryKey: officeKeys.list(params),
    queryFn: async ({ signal }) => {
      const { data } = await OfficeService.getOffices({
        query: { page: params?.page, limit: params?.limit },
        signal,
        throwOnError: true,
      });
      return data;
    },
  });
};

export const useGetOfficeDetailQuery = (id: string, enabled: boolean) => {
  return useQuery<Office | null>({
    queryKey: officeKeys.detail(id),
    queryFn: async () => {
      const { data } = await OfficeService.getOfficeById({ path: { id } });
      return data ?? null;
    },
    enabled,
  });
};

export const useCreateOfficeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Office, unknown, CreateOfficeDto>({
    mutationFn: async (body) => {
      const { data } = await OfficeService.createOffice({ body });
      return data!;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: officeKeys.lists() });
    },
  });
};

export const useUpdateOfficeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Office, unknown, Omit<UpdateOfficeData, "url">>({
    mutationFn: async (opts) => {
      const { data } = await OfficeService.updateOffice({ ...opts });
      return data!;
    },
    onSuccess: (updatedOffice) => {
      void queryClient.invalidateQueries({ queryKey: officeKeys.lists() });
      queryClient.setQueryData(
        officeKeys.detail(updatedOffice.id),
        updatedOffice
      );
    },
  });
};

export const useDeleteOfficeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, Pick<DeleteOfficeData, "path">>({
    mutationFn: async ({ path }) => {
      await OfficeService.deleteOffice({ path });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: officeKeys.lists() });
    },
  });
};
