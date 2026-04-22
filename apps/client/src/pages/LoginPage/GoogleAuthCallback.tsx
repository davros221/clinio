import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
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

    void queryClient.invalidateQueries({ queryKey: [authKeys.me] }).then(() => {
      if (!cancelled) {
        navigate(ROUTER_PATHS.HOME, { replace: true });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [navigate, queryClient]);

  return null;
};
