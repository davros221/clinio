import { USER_ROLES } from "../types/user";
import { useUser } from "../hooks/useUser.ts";
import { AdminDashboard } from "../pages/dashboards/AdminDashboard";
import { DoctorDashboard } from "../pages/dashboards/DoctorDashboard.tsx";
import { NurseDashboard } from "../pages/dashboards/NurseDashboard.tsx";
import { ClientDashboard } from "../pages/dashboards/ClientDashboard.tsx";
import { JSX } from "react";
import { Navigate } from "react-router";
import { ROUTER_PATHS } from "../router/routes.ts";

const roleDashboardMap: Record<string, JSX.Element> = {
  [USER_ROLES.ADMIN]: <AdminDashboard />,
  [USER_ROLES.DOCTOR]: <DoctorDashboard />,
  [USER_ROLES.NURSE]: <NurseDashboard />,
  [USER_ROLES.CLIENT]: <ClientDashboard />,
};

export const DashboardSwitch = () => {
  const user = useUser();
  const role = user?.role;
  const dashboard = role ? roleDashboardMap[role] : undefined;

  if (role && !dashboard) {
    return <Navigate to={ROUTER_PATHS.FORBIDDEN} replace />;
  }

  return dashboard ?? null;
};
