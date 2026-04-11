import { createBrowserRouter, type RouteObject } from "react-router";
import {
  AppLayout,
  AppointmentsOverview,
  AuthLayout,
  DashboardSwitch,
  OfficesOverview,
  PatientsOverview,
  RequireAuth,
} from "@components";
import {
  ForbiddenPage,
  AuthenticatedLayout,
  SignUpPage,
  LoginPage,
} from "@pages";
import { ROUTER_PATHS } from "./routes.ts";

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      {
        path: ROUTER_PATHS.FORBIDDEN,
        element: <ForbiddenPage />,
      },
      {
        element: <AuthLayout />,
        children: [
          {
            path: ROUTER_PATHS.LOGIN,
            element: <LoginPage />,
          },
          {
            path: ROUTER_PATHS.SIGN_UP,
            element: <SignUpPage />,
          },
        ],
      },
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
                element: <PatientsOverview />,
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
