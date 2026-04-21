import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AuthToken } from "@utils";
import { authKeys } from "@api";
import { ROUTER_PATHS } from "@router";

export const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate(ROUTER_PATHS.LOGIN, { replace: true });
      return;
    }

    AuthToken.set(token);

    // Remove token from URL so it doesn't stay in browser history
    void queryClient.invalidateQueries({ queryKey: [authKeys.me] }).then(() => {
      navigate(ROUTER_PATHS.HOME, { replace: true });
    });
  }, [searchParams, navigate, queryClient]);

  return null;
};
