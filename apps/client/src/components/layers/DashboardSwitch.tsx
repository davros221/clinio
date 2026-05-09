import { USER_ROLES } from "../../types/user.ts";
import { useUser } from "../../hooks/useUser.ts";
import { Navigate } from "react-router";
import { ROUTER_PATHS } from "@router";
import { DoctorDashboard, NurseDashboard } from "@pages";

export const DashboardSwitch = () => {
  const { user } = useUser();
  const role = user?.role;

  if (role === USER_ROLES.ADMIN) {
    return <Navigate to={ROUTER_PATHS.OFFICES} replace />;
  }

  if (role === USER_ROLES.DOCTOR) return <DoctorDashboard />;
  if (role === USER_ROLES.NURSE) return <NurseDashboard />;
  if (role === USER_ROLES.CLIENT)
    return <Navigate to={ROUTER_PATHS.APPOINTMENTS} replace />;

  if (role) return <Navigate to={ROUTER_PATHS.FORBIDDEN} replace />;

  return null;
};
