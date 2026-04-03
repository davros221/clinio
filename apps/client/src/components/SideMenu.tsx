import { Stack, Avatar, Text, Group, Divider, Button } from "@mantine/core";

import { NavLink as RouterNavLink } from "react-router";
import { ROUTER_PATHS } from "../router/routes.ts";
import { useUser } from "../hooks/useUser.ts";
import classes from "./SideMenu.module.css";
import { AuthData } from "@clinio/api";
import { useT } from "../hooks/useT";

type NavBtnProps = {
  to: string;
  label: string;
};

const NavBtn = ({ to, label }: NavBtnProps) => (
  <Button
    component={RouterNavLink}
    to={to}
    fullWidth
    justify="start"
    className={classes.navLink}
  >
    {label}
  </Button>
);

const mapNavItem = (
  to: (typeof ROUTER_PATHS)[keyof typeof ROUTER_PATHS],
  label: string
) => {
  return { to, label };
};

export const SideMenu = () => {
  const t = useT();
  const user = useUser();
  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "";

  const getRoleNavItems = (role: AuthData["role"]) => {
    switch (role) {
      case "ADMIN":
        return [
          mapNavItem(ROUTER_PATHS.OFFICES, t("nav.offices")),
          mapNavItem(ROUTER_PATHS.CREATE_PATIENT, t("nav.staff")),
        ];
      case "DOCTOR":
      case "NURSE":
        return [
          mapNavItem(ROUTER_PATHS.OFFICES, t("nav.offices")),
          mapNavItem(ROUTER_PATHS.CREATE_PATIENT, t("nav.patients")),
        ];
      case "CLIENT":
        return [
          mapNavItem(ROUTER_PATHS.OFFICES, t("nav.offices")),
          mapNavItem(ROUTER_PATHS.APPOINTMENTS, t("nav.appointments")),
        ];
      default:
        return [];
    }
  };

  const topNavItems = [
    mapNavItem(ROUTER_PATHS.HOME, t("nav.dashboard")),
    ...(user ? getRoleNavItems(user.role) : []),
  ];

  const bottomNavItems = [
    mapNavItem(ROUTER_PATHS.SETTINGS, t("nav.settings")),
    mapNavItem(ROUTER_PATHS.LOGIN, t("nav.logout")),
  ];

  return (
    <Stack gap="xs" h="100%">
      <Group gap="xxs">
        <Avatar radius="xl" size="lg" color="white">
          {initials}
        </Avatar>

        <div>
          <Text size="sm" c="white" fw={600} lineClamp={1}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text size="xs" c="white">
            {user?.role}
          </Text>
        </div>
      </Group>

      <Divider />

      <Stack h="100%" justify="space-between">
        <Stack gap="xxs">
          {topNavItems.map(({ to, label }) => (
            <NavBtn key={to} to={to} label={label} />
          ))}
        </Stack>

        <Stack gap="xxs">
          {bottomNavItems.map(({ to, label }) => (
            <NavBtn key={to} to={to} label={label} />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};
