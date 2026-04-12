import { useGetMeQuery } from "@api";
import { useQueryClient } from "@tanstack/react-query";
import { AuthToken } from "@utils";

export const useUser = () => {
  const hasToken = AuthToken.exists();
  const queryClient = useQueryClient();

  const { data, isPending } = useGetMeQuery(hasToken);

  const logout = () => {
    AuthToken.clear();
    void queryClient.resetQueries();
  };

  return {
    user: data?.authData,
    loggedIn: data?.auth,
    isLoading: hasToken && isPending,
    logout,
  };
};
