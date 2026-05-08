import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { UserService, CreateUserDto } from "@clinio/api";
import { UserRole } from "@clinio/shared";
import { userKeys } from "./queryKeys";
import { t } from "../i18n";
import { notifySuccess, handleError } from "@utils";

const createUserFn = async (data: CreateUserDto) => {
  const res = await UserService.create({ body: data });
  return res.data;
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      notifySuccess(
        t("patient.notification.createSuccessTitle"),
        t("patient.notification.createSuccessMessage")
      );
    },
    onError: (e) => {
      handleError(e);
    },
  });
};

type GetUsersParams = {
  roles: Array<UserRole>;
  limit?: number;
  page?: number;
  search?: string;
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

const getUserDetailOptions = (id: string) =>
  queryOptions({
    queryFn: async ({ signal }) => {
      const res = await UserService.getById({
        path: { id },
        signal,
      });
      return res.data;
    },
    queryKey: userKeys.detail(id),
  });

export const useGetUserDetailQuery = (id: string) => {
  return useQuery(getUserDetailOptions(id));
};
