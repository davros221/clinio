import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Appointment,
  AppointmentService,
  CreateAppointmentDto,
} from "@clinio/api";
import { AppointmentStatus } from "@clinio/shared";
import { t } from "../i18n";
import { notifyError, notifySuccess } from "../utils/notification";
import { appointmentKeys, calendarKeys } from "./queryKeys";

export type AppointmentListFilters = {
  status?: AppointmentStatus[];
  page?: number;
  limit?: number;
  officeId?: string;
  sortBy?: "date" | "status";
  sortOrder?: "ASC" | "DESC";
};

export const useGetAppointmentListQuery = (
  filters?: AppointmentListFilters,
  enabled = true
) => {
  return useQuery<Appointment[]>({
    queryKey: appointmentKeys.list(filters),
    enabled,
    queryFn: async () => {
      const { data } = await AppointmentService.getAppointments({
        query: {
          status: filters?.status,
          page: filters?.page,
          limit: filters?.limit,
          officeId: filters?.officeId,
          sortBy: filters?.sortBy,
          sortOrder: filters?.sortOrder,
        },
        throwOnError: true,
      });
      return data?.items ?? [];
    },
  });
};

export const useCreateAppointmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Appointment, Error, CreateAppointmentDto>({
    mutationFn: async (body) => {
      const { data } = await AppointmentService.createAppointment({
        body,
        throwOnError: true,
      });
      if (!data) throw new Error(t("common.error.noData"));
      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      notifySuccess(t("appointment.notification.createSuccess"), "");
    },

    onError: (error) =>
      notifyError(t("common.error.createFailed"), error.message),
  });
};

export const useDeleteAppointmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await AppointmentService.deleteAppointment({
        path: { id },
        throwOnError: true,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      notifySuccess(t("appointment.notification.deleteSuccess"), "");
    },

    onError: (error) =>
      notifyError(t("common.error.deleteFailed"), error.message),
  });
};
