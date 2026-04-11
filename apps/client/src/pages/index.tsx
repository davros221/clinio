import { AppShell, Box } from "@mantine/core";
import { Outlet } from "react-router";
import classes from "./index.module.css";
import { SideMenu } from "../components/SideMenu.tsx";

export * from "./LoginPage/LoginPage.tsx";
export * from "./SignUpPage/SignUpPage.tsx";
export * from "./ForbiddenPage.tsx";
export * from "./dashboards";

// ToDo: Rename
export const AuthenticatedLayout = () => {
  return (
    <div className={classes.card}>
      <AppShell navbar={{ width: 220, breakpoint: 0 }}>
        <AppShell.Navbar p="xs">
          <SideMenu />
        </AppShell.Navbar>

        <AppShell.Main>
          <Box m="sm">
            <Outlet />
          </Box>
        </AppShell.Main>
      </AppShell>
    </div>
  );
};
