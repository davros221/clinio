import { useGetMeQuery } from "@api";

export const useUser = () => {
  const token = localStorage.getItem("accessToken");

  const { data, isPending } = useGetMeQuery(!!token);

  return {
    user: data?.authData,
    loggedIn: data?.auth,
    isLoading: !!token && isPending,
  };
};
