import { createBrowserRouter, type RouteObject } from "react-router";
import {
  AppointmentsOverview,
  DashboardSwitch,
  OfficesOverview,
  PatientsOverview,
  RequireAuth,
} from "@components";
import {
  ForbiddenPage,
  SignUpPage,
  LoginPage,
  ActivateAccountPage,
  ResetPasswordPage,
} from "@pages";
import { ROUTER_PATHS } from "./routes.ts";
import { AuthenticatedLayout, PublicLayout, AppLayout } from "@layout";

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      {
        path: ROUTER_PATHS.FORBIDDEN,
        element: <ForbiddenPage />,
      },
      {
        element: <PublicLayout />,
        children: [
          {
            path: ROUTER_PATHS.LOGIN,
            element: <LoginPage />,
          },
          {
            path: ROUTER_PATHS.SIGN_UP,
            element: <SignUpPage />,
          },
          {
            path: ROUTER_PATHS.ACTIVATE_EMAIL,
            element: <ActivateAccountPage />,
          },
          {
            path: ROUTER_PATHS.RESET_PASSWORD,
            element: <ResetPasswordPage />,
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
