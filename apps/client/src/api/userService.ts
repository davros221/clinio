import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { User, UserService, CreateUserDto } from "@clinio/api";
import { UserRole } from "@clinio/shared";
import { userKeys } from "./queryKeys";
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      notifySuccess(
        t("patient.notification.createSuccessTitle"),
        t("patient.notification.createSuccessMessage")
      );
    },
  });
};

type UseGetUsersQueryOptions = {
  role: Array<UserRole>;
  search?: string;
  limit?: number;
  enabled?: boolean;
  sortBy?: "firstName" | "lastName" | "email" | "role";
  sortOrder?: "ASC" | "DESC";
};

// TODO: API returns paginated response — expose pagination metadata when needed.
export const useGetUsersQuery = (opt: UseGetUsersQueryOptions) => {
  const { enabled, ...query } = opt;

  return useQuery<User[]>({
    queryKey: userKeys.list({ ...query }),
    queryFn: async ({ signal }) => {
      const { data } = await UserService.get({
        signal,
        query,
      });
      return data?.items ?? [];
    },
    enabled,
  });
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
