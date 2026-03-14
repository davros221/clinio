import { USER_ROLES } from "../types/user";
import { useUser } from "../hooks/useUser.ts";
import { AdminDashboard } from "../pages/dashboards/AdminDashboard";
import { DoctorDashboard } from "../pages/dashboards/DoctorDashboard.tsx";
import { NurseDashboard } from "../pages/dashboards/NurseDashboard.tsx";
import { ClientDashboard } from "../pages/dashboards/ClientDashboard.tsx";
import { JSX, useEffect } from "react";
import { router } from "../router/router.tsx";
import { ROUTER_PATHS } from "../router/routes.ts";

export const DashboardSwitch = () => {
  const user = useUser();
  const role = user?.role;

  const roleDashboardMap: Record<string, JSX.Element> = {
    [USER_ROLES.ADMIN]: <AdminDashboard />,
    [USER_ROLES.DOCTOR]: <DoctorDashboard />,
    [USER_ROLES.NURSE]: <NurseDashboard />,
    [USER_ROLES.CLIENT]: <ClientDashboard />,
  };

  const dashboard = role ? roleDashboardMap[role] : undefined;

  useEffect(() => {
    if (role && !dashboard) {
      router.navigate(ROUTER_PATHS.FORBIDDEN);
    }
  }, [role, dashboard]);

  return dashboard ?? null;
};
