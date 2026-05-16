import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { UserService, CreateUserDto } from "@clinio/api";
import { UserRole } from "@clinio/shared";
import { userKeys } from "./queryKeys";
import { systemKeys } from "./systemService";
import { t } from "../i18n";
import { notifySuccess } from "@utils";

const createUserFn = async (data: CreateUserDto) => {
  const res = await UserService.create({ body: data });
  return res.data;
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserFn,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      if (variables.role === UserRole.ADMIN) {
        void queryClient.invalidateQueries({ queryKey: systemKeys.status });
      }
      notifySuccess(
        t("user.notification.createSuccessTitle"),
        t("user.notification.createSuccessMessage")
      );
    },
  });
};

type GetUsersParams = {
  roles: Array<UserRole>;
  limit?: number;
  page?: number;
  search?: string;
  sortBy?: "firstName" | "lastName" | "email" | "role";
  sortOrder?: "ASC" | "DESC";
};

const getUsersListOptions = (params: GetUsersParams, enabled = true) =>
  queryOptions({
    queryFn: async ({ signal }) => {
      const res = await UserService.get({
        query: {
          role: params.roles,
          page: params.page,
          limit: params.limit,
          search: params.search,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        },
        signal,
        throwOnError: true,
      });
      return res.data;
    },
    queryKey: userKeys.list(params),
    enabled,
  });

export const useGetUsersQuery = (params: GetUsersParams, enabled = true) => {
  return useQuery(getUsersListOptions(params, enabled));
};

/*
 * ------------------------- GET user detail
 */

const getUserDetailOptions = (id: string, enabled?: boolean) =>
  queryOptions({
    queryFn: async ({ signal }) => {
      const res = await UserService.getById({
        path: { id },
        signal,
      });
      return res.data;
    },
    queryKey: userKeys.detail(id),
    enabled,
  });

export const useGetUserDetailQuery = (id: string, enabled?: boolean) => {
  return useQuery(getUserDetailOptions(id, enabled));
};
