import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Appointment,
  AppointmentService,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  RescheduleAppointmentDto,
} from "@clinio/api";
import { AppointmentStatus } from "@clinio/shared";
import { t } from "../i18n";
import { handleError, notifySuccess } from "../utils/notification";
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
      const { data, error } = await AppointmentService.getAppointments({
        query: {
          status: filters?.status,
          page: filters?.page,
          limit: filters?.limit,
          officeId: filters?.officeId,
          sortBy: filters?.sortBy,
          sortOrder: filters?.sortOrder,
        },
      });
      if (error) throw error;
      return data!.items;
    },
  });
};

export const useCreateAppointmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Appointment, unknown, CreateAppointmentDto>({
    mutationFn: async (body) => {
      const { data, error } = await AppointmentService.createAppointment({
        body,
      });
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      notifySuccess(t("appointment.notification.createSuccess"), "");
    },
    onError: handleError,
  });
};

export const useDeleteAppointmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: async (id) => {
      const { error } = await AppointmentService.deleteAppointment({
        path: { id },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      notifySuccess(t("appointment.notification.deleteSuccess"), "");
    },
    onError: handleError,
  });
};

export const useUpdateAppointmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Appointment,
    unknown,
    { id: string; dto: UpdateAppointmentDto }
  >({
    mutationFn: async ({ id, dto }) => {
      const { data, error } = await AppointmentService.updateAppointment({
        path: { id },
        body: dto,
      });
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      notifySuccess(t("appointment.notification.updateSuccess"), "");
    },
    onError: handleError,
  });
};

export const useRescheduleAppointmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Appointment,
    unknown,
    { id: string; dto: RescheduleAppointmentDto }
  >({
    mutationFn: async ({ id, dto }) => {
      const { data, error } = await AppointmentService.rescheduleAppointment({
        path: { id },
        body: dto,
      });
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      notifySuccess(t("appointment.notification.rescheduleSuccess"), "");
    },
    onError: handleError,
  });
};

export const useCancelAppointmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Appointment, unknown, string>({
    mutationFn: async (id) => {
      const { data, error } = await AppointmentService.cancelAppointment({
        path: { id },
      });
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      notifySuccess(t("appointment.notification.cancelSuccess"), "");
    },
    onError: handleError,
  });
};
