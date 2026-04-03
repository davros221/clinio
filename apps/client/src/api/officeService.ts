import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateOfficeDto,
  Office,
  OfficeService,
  type UpdateOfficeData,
  type DeleteOfficeData,
} from "@clinio/api";
import { t } from "../i18n";
import { notifyError } from "../utils/notification";
import { officeKeys } from "./queryKeys";

// TODO: API returns PaginatedOfficeResponse — expose pagination metadata when
// the offices table needs server-side paging (total, page, limit, totalPages).
export const useGetOfficeListQuery = () => {
  return useQuery<Office[]>({
    queryKey: officeKeys.list(),
    queryFn: async () => {
      const { data } = await OfficeService.getOffices({
        throwOnError: true,
      });
      return data?.items ?? [];
    },
  });
};

export const useGetOfficeDetailQuery = (id: string, enabled: boolean) => {
  return useQuery<Office | null>({
    queryKey: officeKeys.detail(id),
    queryFn: async () => {
      const { data } = await OfficeService.getOfficeById({
        path: { id },
        throwOnError: true,
      });
      return data ?? null;
    },
    enabled,
  });
};

export const useCreateOfficeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Office, Error, CreateOfficeDto>({
    mutationFn: async (body) => {
      const { data } = await OfficeService.createOffice({
        body,
        throwOnError: true,
      });
      if (!data) throw new Error(t("common.error.noData"));
      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: officeKeys.lists() });
    },

    onError: (error) =>
      notifyError(t("common.error.createFailed"), error.message),
  });
};

export const useUpdateOfficeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Office, Error, Omit<UpdateOfficeData, "url">>({
    mutationFn: async (data) => {
      const { data: office } = await OfficeService.updateOffice({
        ...data,
        throwOnError: true,
      });

      if (!office) throw new Error(t("common.error.noData"));
      return office;
    },

    onSuccess: (updatedOffice) => {
      queryClient.invalidateQueries({ queryKey: officeKeys.lists() });
      queryClient.setQueryData(
        officeKeys.detail(updatedOffice.id),
        updatedOffice
      );
    },
    onError: (error) =>
      notifyError(t("common.error.updateFailed"), error.message),
  });
};

export const useDeleteOfficeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Pick<DeleteOfficeData, "path">>({
    mutationFn: async ({ path }) => {
      await OfficeService.deleteOffice({
        path,
        throwOnError: true,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: officeKeys.lists() });
    },

    onError: (error) =>
      notifyError(t("common.error.deleteFailed"), error.message),
  });
};
