import { useUser } from "../../hooks/useUser.ts";
import { Navigate } from "react-router";
import { ROUTER_PATHS } from "@router";
import { ClientDashboard, DoctorDashboard, NurseDashboard } from "@pages";
import { UserRole } from "@clinio/shared";

export const DashboardSwitch = () => {
  const { user } = useUser();
  const role = user?.role;

  if (role === UserRole.ADMIN) {
    return <Navigate to={ROUTER_PATHS.OFFICES} replace />;
  }

  if (role === UserRole.DOCTOR) return <DoctorDashboard />;
  if (role === UserRole.NURSE) return <NurseDashboard />;
  if (role === UserRole.CLIENT) return <ClientDashboard />;

  if (role) return <Navigate to={ROUTER_PATHS.FORBIDDEN} replace />;

  return null;
};
