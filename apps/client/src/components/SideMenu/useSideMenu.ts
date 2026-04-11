import { useT } from "../../hooks/useT.ts";
import { SideMenuItemProps } from "./SideMenuItemProps.ts";
import { useMemo } from "react";
import { ROUTER_PATHS } from "@router";
import { UserRole } from "@clinio/shared";
import { useUser } from "../../hooks/useUser.ts";
import { getInitials } from "@utils";

export const useSideMenu = () => {
  const t = useT();
  const { logout, user } = useUser();

  const initials = getInitials(user?.firstName, user?.lastName);

  // stable refearence to nav items
  const navItems: SideMenuItemProps[] = useMemo(
    () => [
      {
        to: ROUTER_PATHS.HOME,
        label: t("nav.dashboard"),
      },
      {
        to: ROUTER_PATHS.OFFICES,
        label: t("nav.offices"),
      },
      {
        // ToDo: Route name doesn't seem corect and not matchilg the label
        to: ROUTER_PATHS.CREATE_PATIENT,
        label: t("nav.staff"),
        allowed: [UserRole.ADMIN, UserRole.NURSE, UserRole.DOCTOR],
      },
      {
        to: ROUTER_PATHS.APPOINTMENTS,
        label: t("nav.appointments"),
        allowed: [UserRole.CLIENT],
      },
      {
        pushToBottom: true,
        to: ROUTER_PATHS.SETTINGS,
        label: t("nav.settings"),
      },
      {
        label: t("nav.logout"),
        onClick: logout,
      },
    ],
    [t, logout]
  );

  return {
    navItems,
    initials,
    user,
  };
};
