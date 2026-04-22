import {
  AppShell,
  Avatar,
  Box,
  Burger,
  Group,
  Overlay,
  Text,
} from "@mantine/core";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import { SideMenu } from "@components";
import { useUser } from "../../hooks/useUser.ts";
import { useMobileView } from "../../hooks/useMobileView.ts";
import { StringUtils } from "@utils";
import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import styles from "./authLayout.module.css";

export const AuthenticatedLayout = () => {
  const [opened, { toggle, close }] = useDisclosure();
  const isMobile = useMobileView();
  const { user } = useUser();
  const initials = StringUtils.getInitials(user?.firstName, user?.lastName);
  const location = useLocation();

  // Close mobile menu on navigation
  useEffect(() => {
    close();
  }, [location.pathname, close]);

  // Close mobile menu on Escape
  useHotkeys(opened ? [["Escape", close]] : []);

  return (
    <div className={styles.card}>
      <AppShell
        navbar={{
          width: 220,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
      >
        {isMobile && (
          <div className={styles.mobileHeader}>
            <Group h="100%" px="sm" justify="space-between">
              <Group gap="xs">
                <Avatar radius="xl" size="sm" color="white">
                  {initials}
                </Avatar>
                <div>
                  <Text c="white" fw={600} size="sm" lineClamp={1} lh={1.2}>
                    {user?.firstName} {user?.lastName}
                  </Text>
                  <Text c="white" size="xs" opacity={0.7} lh={1.2}>
                    {user?.role}
                  </Text>
                </div>
              </Group>
              <Burger
                opened={opened}
                onClick={toggle}
                size="sm"
                color="white"
              />
            </Group>
          </div>
        )}

        <AppShell.Navbar p="xs">
          <SideMenu showUserInfo={!isMobile} />
        </AppShell.Navbar>

        <AppShell.Main>
          <Box m="sm">
            <Outlet />
          </Box>
        </AppShell.Main>
      </AppShell>

      {opened && (
        <Overlay backgroundOpacity={0.5} zIndex={199} onClick={close} />
      )}
    </div>
  );
};
