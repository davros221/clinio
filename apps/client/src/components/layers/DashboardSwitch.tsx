import { Navigate } from "react-router";
import { ROUTER_PATHS } from "@router";
import { USER_ROLES } from "../../types/user.ts";
import { useUser } from "../../hooks/useUser.ts";

export const DashboardSwitch = () => {
  const { user } = useUser();

  if (user?.role === USER_ROLES.CLIENT) {
    return <Navigate to={ROUTER_PATHS.APPOINTMENTS} replace />;
  }

  return <Navigate to={ROUTER_PATHS.OFFICES} replace />;
};
