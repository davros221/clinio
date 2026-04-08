import { useQuery } from "@tanstack/react-query";
import { User, UserService } from "@clinio/api";
import { UserRole } from "@clinio/shared";
import { userKeys } from "./queryKeys";

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
