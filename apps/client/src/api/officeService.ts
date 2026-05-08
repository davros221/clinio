import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateOfficeDto,
  Office,
  OfficeService,
  type UpdateOfficeData,
  type DeleteOfficeData,
} from "@clinio/api";
import { officeKeys } from "./queryKeys";

// TODO: API returns PaginatedOfficeResponse — expose pagination metadata when
// the offices table needs server-side paging (total, page, limit, totalPages).
export const useGetOfficeListQuery = () => {
  return useQuery<Office[]>({
    queryKey: officeKeys.list(),
    queryFn: async () => {
      const { data } = await OfficeService.getOffices();
      return data!.items;
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
