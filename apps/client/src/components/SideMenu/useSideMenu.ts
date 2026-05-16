import { useT, useUser, useUserRole } from "@hooks";
import { SideMenuItemProps } from "./SideMenuItemProps.ts";
import { useMemo } from "react";
import { ROUTER_PATHS } from "@router";
import { UserRole } from "@clinio/shared";
import { StringUtils } from "@utils";
import { useGetRoomsQuery } from "@modules/chat";

export const useSideMenu = (showUserInfo = true) => {
  const t = useT();
  const { logout, user } = useUser();
  const { isOnboardingClient } = useUserRole();

  const initials = showUserInfo
    ? StringUtils.getInitials(user?.firstName, user?.lastName)
    : "";
  const isAdmin = user?.role === UserRole.ADMIN;
  const { data: rooms } = useGetRoomsQuery();
  const totalUnread = rooms?.reduce((sum, r) => sum + r.unreadCount, 0) ?? 0;

  const navItems = useMemo(() => {
    if (isOnboardingClient) return [];

    return [
      {
        to: ROUTER_PATHS.APPOINTMENTS,
        label: t("nav.appointments"),
        allowed: [UserRole.CLIENT],
      },
      {
        to: ROUTER_PATHS.OFFICES,
        label: t("nav.offices"),
      },
      {
        to: isAdmin ? ROUTER_PATHS.STAFF : ROUTER_PATHS.PATIENTS,
        label: isAdmin ? t("nav.staff") : t("nav.patients"),
        allowed: [UserRole.ADMIN, UserRole.NURSE, UserRole.DOCTOR],
      },
      {
        to: ROUTER_PATHS.APPOINTMENTS_CALENDAR,
        label: t("nav.calendar"),
        allowed: [UserRole.CLIENT],
      },
      {
        to: ROUTER_PATHS.APPOINTMENTS,
        label: t("nav.calendar"),
        allowed: [UserRole.NURSE, UserRole.DOCTOR],
      },
      {
        to: ROUTER_PATHS.CHAT,
        label: t("nav.messages"),
        badge: totalUnread > 0 ? String(totalUnread) : undefined,
      },
    ] as SideMenuItemProps[];
  }, [t, isAdmin, isOnboardingClient, totalUnread]);

  const bottomItems = useMemo<SideMenuItemProps[]>(
    () => [
      { to: ROUTER_PATHS.SETTINGS, label: t("nav.settings") },
      { label: t("nav.logout"), onClick: logout },
    ],
    [t, logout]
  );

  return {
    navItems,
    bottomItems,
    initials,
    user,
  };
};
