import { USER_ROLES } from "../types/user";
import { useAuth } from "../hooks/useAuth";
import { AdminDashboard } from "../pages/dashboards/AdminDashboard";
import DoctorDashboard from "../pages/dashboards/DoctorDashboard";
import NurseDashboard from "../pages/dashboards/NurseDashboard";
import ClientDashboard from "../pages/dashboards/ClientDashboard";

export const DashboardSwitch = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case USER_ROLES.ADMIN:
      return <AdminDashboard />;
    case USER_ROLES.DOCTOR:
      return <DoctorDashboard />;
    case USER_ROLES.NURSE:
      return <NurseDashboard />;
    case USER_ROLES.CLIENT:
      return <ClientDashboard />;
    default:
      return <div>Unknown role</div>;
  }
};
