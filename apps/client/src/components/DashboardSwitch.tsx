import { USER_ROLES } from "../types/user";
import { useUser } from "../hooks/useUser.ts";
import { AdminDashboard } from "../pages/dashboards/AdminDashboard";
import { DoctorDashboard } from "../pages/dashboards/DoctorDashboard.tsx";
import { NurseDashboard } from "../pages/dashboards/NurseDashboard.tsx";
import { ClientDashboard } from "../pages/dashboards/ClientDashboard.tsx";

export const DashboardSwitch = () => {
  const { role } = useUser();

  if (!role) return null;

  switch (role) {
    case USER_ROLES.ADMIN:
      return <AdminDashboard />;
    case USER_ROLES.DOCTOR:
      return <DoctorDashboard />;
    case USER_ROLES.NURSE:
      return <NurseDashboard />;
    case USER_ROLES.CLIENT:
    default:
      return <ClientDashboard />;
  }
};
