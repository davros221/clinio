import { useGetMeQuery } from "@api";
import { useQueryClient } from "@tanstack/react-query";
import { AuthToken } from "@utils";

export const useUser = () => {
  const token = AuthToken.get();
  const queryClient = useQueryClient();

  const { data, isPending } = useGetMeQuery(!!token);

  const logout = () => {
    AuthToken.clear();
    void queryClient.resetQueries();
  };

  return {
    user: data?.authData,
    loggedIn: data?.auth,
    isLoading: !!token && isPending,
    logout,
  };
};
