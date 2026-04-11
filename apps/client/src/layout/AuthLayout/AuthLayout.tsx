import { AppShell, Box } from "@mantine/core";
import { SideMenu } from "@components";
import { Outlet } from "react-router";
import styles from "./authLayout.module.css";

export const AuthenticatedLayout = () => {
  return (
    <div className={styles.card}>
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
