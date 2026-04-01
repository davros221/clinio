import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateOfficeDto,
  Office,
  OfficeService,
  type UpdateOfficeData,
} from "@clinio/api";
import { t } from "../i18n";
import { notifyError } from "../utils/notification";

export const useGetOfficesQuery = () => {
  return useQuery<Office[]>({
    queryKey: ["useGetOfficesQuery"],
    queryFn: async () => {
      const { data } = await OfficeService.getOffices({
        throwOnError: true,
      });
      return data ?? [];
    },
  });
};

export const useGetOfficeDetailQuery = (id: string, enabled: boolean) => {
  return useQuery<Office | null>({
    queryKey: ["useGetOfficeDetailQuery", id],
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
      queryClient.invalidateQueries({ queryKey: ["useGetOfficesQuery"] });
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
      queryClient.invalidateQueries({ queryKey: ["useGetOfficesQuery"] });
      queryClient.setQueryData(
        ["useGetOfficeDetailQuery", updatedOffice.id],
        updatedOffice
      );
    },
    onError: (error) =>
      notifyError(t("common.error.updateFailed"), error.message),
  });
};
