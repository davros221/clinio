import { USER_ROLES } from "../types/user";
import { useUser } from "../hooks/useUser.ts";
import { AdminDashboard } from "../pages/dashboard/AdminDashboard.tsx";
import { DoctorDashboard } from "../pages/dashboard/DoctorDashboard.tsx";
import { NurseDashboard } from "../pages/dashboard/NurseDashboard.tsx";
import { ClientDashboard } from "../pages/dashboard/ClientDashboard.tsx";
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
