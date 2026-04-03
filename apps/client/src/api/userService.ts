import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User, UserService, CreateUserDto } from "@clinio/api";
import { UserRole } from "@clinio/shared";
import { userKeys } from "./queryKeys";
import { t } from "../i18n";
import { notifySuccess, notifyError } from "../utils/notification";

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
      notifyError(t("common.error.createFailed"), e.message);
    },
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
