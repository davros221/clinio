import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User, UserService, CreateUserDto } from "@clinio/api";
import { UserRole } from "@clinio/shared";
import { userKeys } from "./queryKeys";
import { t } from "../i18n";
import { notifySuccess, notifyError } from "../utils/notification";

export type CreatePatientDto = Omit<CreateUserDto, "role" | "password">;

export const useCreatePatientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, CreatePatientDto>({
    mutationFn: async (body) => {
      const { data } = await UserService.create({
        body: { ...body, role: "CLIENT" },
        throwOnError: true,
      });
      if (!data) throw new Error(t("common.error.noData"));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      notifySuccess(
        t("patient.notification.createSuccessTitle"),
        t("patient.notification.createSuccessMessage")
      );
    },
    onError: (error) =>
      notifyError(t("common.error.createFailed"), error.message),
  });
};

export type CreateStaffDto = Required<
  Pick<CreateUserDto, "email" | "firstName" | "lastName" | "password" | "role">
>;

export const useCreateStaffMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, CreateStaffDto>({
    mutationFn: async (body) => {
      const { data } = await UserService.create({
        body,
        throwOnError: true,
      });
      if (!data) throw new Error(t("common.error.noData"));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      notifySuccess(
        t("user.notification.createSuccessTitle"),
        t("user.notification.createSuccessMessage")
      );
    },
    onError: (error) =>
      notifyError(t("common.error.createFailed"), error.message),
  });
};

// TODO: API returns paginated response — expose pagination metadata when needed.
export const useGetUsersQuery = (roles: Array<UserRole>, enabled = true) => {
  return useQuery<User[]>({
    queryKey: userKeys.list({ roles }),
    queryFn: async () => {
      const { data } = await UserService.get({
        query: { role: roles },
        throwOnError: true,
      });
      return data?.items ?? [];
    },
    enabled,
  });
};
