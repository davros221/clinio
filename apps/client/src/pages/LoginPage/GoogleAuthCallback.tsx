import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AuthService, MeResponse } from "@clinio/api";
import { UserRole } from "@clinio/shared";
import { AuthToken } from "@utils";
import { authKeys } from "@api";
import { ROUTER_PATHS } from "@router";

export const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token =
      new URLSearchParams(window.location.hash.substring(1)).get("token") ??
      new URLSearchParams(window.location.search).get("token");

    if (!token) {
      navigate(ROUTER_PATHS.LOGIN, { replace: true });
      return;
    }

    AuthToken.set(token);

    let cancelled = false;

    void queryClient
      .fetchQuery({
        queryKey: [authKeys.me],
        queryFn: async (): Promise<MeResponse> => {
          const res = await AuthService.me();
          return res.data as MeResponse;
        },
      })
      .then((meData: MeResponse) => {
        if (!cancelled) {
          const isAdmin = meData?.authData?.role === UserRole.ADMIN;
          navigate(isAdmin ? ROUTER_PATHS.OFFICES : ROUTER_PATHS.HOME, {
            replace: true,
          });
        }
      })
      .catch(() => {
        if (!cancelled) navigate(ROUTER_PATHS.LOGIN, { replace: true });
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, queryClient]);

  return null;
};
