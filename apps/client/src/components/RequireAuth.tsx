import { Navigate, Outlet, useLocation } from "react-router";
import { useUser } from "../hooks/useUser.ts";
import { ROUTER_PATHS } from "@router";

export const RequireAuth = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const { user, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return (
      <Navigate to={ROUTER_PATHS.LOGIN} state={{ from: location }} replace />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTER_PATHS.FORBIDDEN} replace />;
  }

  return <Outlet />;
};
