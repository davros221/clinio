import { useGetMeQuery, useLogout } from "@api";
import { AuthToken } from "@utils";

export const useUser = () => {
  const hasToken = AuthToken.exists();
  const logout = useLogout();

  const { data, isPending } = useGetMeQuery(hasToken);

  return {
    user: data?.authData,
    loggedIn: data?.auth,
    isLoading: hasToken && isPending,
    logout,
  };
};
