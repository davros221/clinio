import { useT, useUser, useUserRole } from "@hooks";
import { SideMenuItemProps } from "./SideMenuItemProps.ts";
import { useMemo } from "react";
import { ROUTER_PATHS } from "@router";
import { UserRole } from "@clinio/shared";
import { StringUtils } from "@utils";

export const useSideMenu = () => {
  const t = useT();
  const { logout, user } = useUser();
  const { isOnboardingClient } = useUserRole();

  const initials = StringUtils.getInitials(user?.firstName, user?.lastName);
  const userListTitle =
    user?.role === UserRole.ADMIN ? t("nav.staff") : t("nav.patients");

  const navItems = useMemo(() => {
    if (isOnboardingClient) return [];

    return [
      {
        to: ROUTER_PATHS.HOME,
        label: t("nav.dashboard"),
      },
      {
        to: ROUTER_PATHS.OFFICES,
        label: t("nav.offices"),
      },
      {
        to: ROUTER_PATHS.PATIENTS,
        label: userListTitle,
        allowed: [UserRole.ADMIN, UserRole.NURSE, UserRole.DOCTOR],
      },
      {
        to: ROUTER_PATHS.APPOINTMENTS,
        label: t("nav.appointments"),
        allowed: [UserRole.CLIENT, UserRole.NURSE, UserRole.DOCTOR],
      },
    ] as SideMenuItemProps[];
  }, [t, userListTitle, isOnboardingClient]);

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
