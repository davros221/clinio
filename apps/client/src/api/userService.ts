import { useQuery } from "@tanstack/react-query";
import { User, UserService } from "@clinio/api";
import { UserRole } from "@clinio/shared";

export const useGetUsersQuery = (roles: Array<UserRole>) => {
  return useQuery<User[]>({
    queryKey: ["user", roles],
    queryFn: async () => {
      const { data } = await UserService.get({
        query: { role: roles },
        throwOnError: true,
      });
      return data ?? [];
    },
  });
};
