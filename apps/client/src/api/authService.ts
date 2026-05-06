import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AuthService,
  LoginDto,
  MeResponse,
  ResetPasswordDto,
} from "@clinio/api";
import { authKeys } from "./queryKeys.ts";
import { AuthToken, handleError, notifySuccess } from "@utils";
import { useT } from "@hooks";

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
        auth: true,
        authData: res.authData,
      }));
    },
    onError: (e) => {
      handleError(e);
    },
  });
};

const requestPassResetFn = async (email: string) => {
  const res = await AuthService.requestPasswordReset({
    body: { email },
  });
  return res;
};

export const useRequestPassReset = () => {
  const t = useT();
  return useMutation({
    mutationFn: requestPassResetFn,
    onSuccess: () => {
      notifySuccess(
        t("common.auth.emailSent.title"),
        t("common.auth.emailSent.message")
      );
    },
    onError: (e) => {
      handleError(e);
    },
  });
};

const resetPasswordFn = async (data: ResetPasswordDto) => {
  const res = await AuthService.resetPassword({
    body: data,
  });
  return res.data;
};

export const useResetPasswordMutation = () => {
  const t = useT();
  return useMutation({
    mutationFn: resetPasswordFn,
    onSuccess: () => {
      notifySuccess(
        t("common.auth.passwordReset.title"),
        t("common.auth.passwordReset.message")
      );
    },
    onError: (e) => {
      handleError(e);
    },
  });
};
