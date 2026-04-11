import { createBrowserRouter, type RouteObject } from "react-router";
import { Login } from "../pages/login";
import { RequireAuth } from "../components/RequireAuth.tsx";
import { DashboardSwitch } from "../components/DashboardSwitch.tsx";
import { AppLayout } from "../components/AppLayout";
import { AuthenticatedLayout } from "../pages";
import { ROUTER_PATHS } from "./routes.ts";
import { ForbiddenPage } from "../pages/ForbiddenPage.tsx";
import { OfficesOverview } from "../components/office/OfficesOverview.tsx";
import { CreatePatientPage } from "../pages/patients/CreatePatientPage";
import { AppointmentsOverview } from "../components/appointments/AppointmentsOverview.tsx";

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      {
        path: ROUTER_PATHS.FORBIDDEN,
        element: <ForbiddenPage />,
      },
      {
        path: ROUTER_PATHS.LOGIN,
        element: <Login />,
      },
      // Protected Routes
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AuthenticatedLayout />,
            children: [
              {
                path: ROUTER_PATHS.HOME,
                element: <DashboardSwitch />,
              },
              {
                path: ROUTER_PATHS.OFFICES,
                element: <OfficesOverview />,
              },
              {
                path: ROUTER_PATHS.CREATE_PATIENT,
                element: <CreatePatientPage />,
              },
              {
                path: ROUTER_PATHS.APPOINTMENTS,
                element: <AppointmentsOverview />,
              },
              {
                path: ROUTER_PATHS.SETTINGS,
                element: <div>Settings - placeholder - TBD</div>, // TODO TBD
              },
            ],
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
