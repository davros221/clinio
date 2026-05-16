import { Navigate } from "react-router";
import { ROUTER_PATHS } from "@router";
import { useUser } from "../../hooks/useUser.ts";
import { UserRole } from "@clinio/shared";

export const DashboardSwitch = () => {
  const { user } = useUser();

  if (user?.role === UserRole.CLIENT) {
    return <Navigate to={ROUTER_PATHS.APPOINTMENTS} replace />;
  }

  return <Navigate to={ROUTER_PATHS.OFFICES} replace />;
};
