import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthService, LoginDto, MeResponse } from "@clinio/api";
import { authKeys } from "./queryKeys.ts";
import { AuthToken } from "@utils";

const meFn = async () => {
  const res = await AuthService.me();
  return res.data;
};

export const useGetMeQuery = (enabled = true) => {
  return useQuery({
    queryFn: meFn,
    queryKey: [authKeys.me],
    enabled,
  });
};

const loginFn = async (data: LoginDto) => {
  const res = await AuthService.login({ body: data });
  return res.data;
};

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginFn,
    onSuccess: (res) => {
      if (!res) return;
      AuthToken.set(res.accessToken);
      queryClient.setQueryData<MeResponse>([authKeys.me], (old) => ({
        auth: false,
        authData: res.authData,
      }));
    },
  });
};
