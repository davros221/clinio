import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { APP_PATHS } from "../router/routes.ts";

export const RequireAuth = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={APP_PATHS.LOGIN} state={{ from: location }} replace />;
  }

  // Basic role-based access control
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // TODO TBD Return unauthorized or home (which will redirect to correct dashboard anyway)
    // For now simply redirect to home to prevent infinite loops if home is allowed
    return <Navigate to={APP_PATHS.HOME} replace />;
  }

  return <Outlet />;
};
