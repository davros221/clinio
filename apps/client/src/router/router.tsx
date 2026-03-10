import { createBrowserRouter, type RouteObject } from "react-router";
import { Login } from "../pages/Login.tsx";
import { RootLayout } from "../components/RootLayout.tsx";
import { RequireAuth } from "../components/RequireAuth.tsx";
import { DashboardSwitch } from "../components/DashboardSwitch.tsx";
import { APP_PATHS } from "./routes.ts";
import { ForbiddenPage } from "../pages/ForbiddenPage.tsx";

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      {
        path: APP_PATHS.FORBIDDEN,
        element: <ForbiddenPage />,
      },
      {
        path: APP_PATHS.LOGIN,
        element: <Login />,
      },
      // Protected Routes
      {
        element: <RequireAuth />,
        children: [
          {
            path: APP_PATHS.HOME,
            element: <DashboardSwitch />,
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
