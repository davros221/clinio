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
import { notifySuccess } from "../utils/notification";
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
  enabled = true,
  throwOnError = true
) => {
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    enabled,
    throwOnError,
    queryFn: async ({ signal }) => {
      const { data } = await AppointmentService.getAppointments({
        query: {
          status: filters?.status,
          page: filters?.page,
          limit: filters?.limit,
          officeId: filters?.officeId,
          sortBy: filters?.sortBy,
          sortOrder: filters?.sortOrder,
        },
        signal,
        throwOnError,
      });
      return data;
    },
  });
};

export const useCreateAppointmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Appointment, unknown, CreateAppointmentDto>({
    mutationFn: async (body) => {
      const { data } = await AppointmentService.createAppointment({ body });
      return data!;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      notifySuccess(t("appointment.notification.createSuccess"), "");
    },
  });
};

export const useDeleteAppointmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: async (id) => {
      await AppointmentService.deleteAppointment({ path: { id } });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      notifySuccess(t("appointment.notification.deleteSuccess"), "");
    },
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
      const { data } = await AppointmentService.updateAppointment({
        path: { id },
        body: dto,
      });
      return data!;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      notifySuccess(t("appointment.notification.updateSuccess"), "");
    },
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
      const { data } = await AppointmentService.rescheduleAppointment({
        path: { id },
        body: dto,
      });
      return data!;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      notifySuccess(t("appointment.notification.rescheduleSuccess"), "");
    },
  });
};

export const useCancelAppointmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Appointment, unknown, string>({
    mutationFn: async (id) => {
      const { data } = await AppointmentService.cancelAppointment({
        path: { id },
      });
      return data!;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      notifySuccess(t("appointment.notification.cancelSuccess"), "");
    },
  });
};
