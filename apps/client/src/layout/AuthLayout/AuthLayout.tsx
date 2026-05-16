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
import { useUser } from "@hooks";
import { useMobileView } from "@hooks";
import { StringUtils } from "@utils";
import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./authLayout.module.css";
import { ErrorBoundary } from "react-error-boundary";
import { CommonErrorPage } from "@pages";
import { useChatSocket } from "@modules/chat";
import { ChatNotifier } from "./components/ChatNotifier.tsx";

export const AuthenticatedLayout = () => {
  const [opened, { toggle, close }] = useDisclosure();
  const isMobile = useMobileView();
  const { user } = useUser();
  const { t } = useTranslation();
  useChatSocket(user?.id);
  const initials = StringUtils.getInitials(user?.firstName, user?.lastName);
  const location = useLocation();

  // Close mobile menu on navigation
  useEffect(() => {
    close();
  }, [location.pathname, close]);

  // Close mobile menu when crossing to desktop so the overlay can't get stranded
  useEffect(() => {
    if (!isMobile) close();
  }, [isMobile, close]);

  // Close mobile menu on Escape
  useHotkeys(opened ? [["Escape", close]] : []);

  return (
    <div className={styles.card}>
      <ChatNotifier />
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
                aria-label={t(opened ? "nav.closeMenu" : "nav.openMenu")}
                aria-expanded={opened}
              />
            </Group>
          </div>
        )}

        <AppShell.Navbar p="xs">
          <SideMenu showUserInfo={!isMobile} />
        </AppShell.Navbar>

        <AppShell.Main>
          <ErrorBoundary fallback={<CommonErrorPage />} key={location.pathname}>
            <Box p="sm" h={"100%"}>
              <Outlet />
            </Box>
          </ErrorBoundary>
        </AppShell.Main>
      </AppShell>

      {isMobile && opened && (
        <Overlay
          backgroundOpacity={0.5}
          style={{ zIndex: "var(--z-backdrop)" }}
          onClick={close}
        />
      )}
    </div>
  );
};
