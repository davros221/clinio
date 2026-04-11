import { USER_ROLES } from "../types/user";
import { useUser } from "../hooks/useUser.ts";
import { JSX } from "react";
import { Navigate } from "react-router";
import { ROUTER_PATHS } from "@router";
import {
  AdminDashboard,
  ClientDashboard,
  DoctorDashboard,
  NurseDashboard,
} from "@pages";

const roleDashboardMap: Record<string, JSX.Element> = {
  [USER_ROLES.ADMIN]: <AdminDashboard />,
  [USER_ROLES.DOCTOR]: <DoctorDashboard />,
  [USER_ROLES.NURSE]: <NurseDashboard />,
  [USER_ROLES.CLIENT]: <ClientDashboard />,
};

export const DashboardSwitch = () => {
  const { user } = useUser();
  const role = user?.role;
  const dashboard = role ? roleDashboardMap[role] : undefined;

  if (role && !dashboard) {
    return <Navigate to={ROUTER_PATHS.FORBIDDEN} replace />;
  }

  return dashboard ?? null;
};
