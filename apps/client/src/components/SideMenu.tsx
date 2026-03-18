import { Stack, Avatar, Text, Group, Divider, Button } from "@mantine/core";

import { NavLink as RouterNavLink } from "react-router";
import { ROUTER_PATHS } from "../router/routes.ts";
import { useUser } from "../hooks/useUser.ts";
import classes from "./SideMenu.module.css";

type NavBtnItem = {
  to: string;
  label: string;
};

type NavBtnProps = NavBtnItem & {
  isLast?: boolean;
};

const NavBtn = ({ to, label, isLast = false }: NavBtnProps) => (
  <Button
    component={RouterNavLink}
    to={to}
    fullWidth
    justify="start"
    className={classes.navLink}
    mb={isLast ? undefined : "xs"}
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

const topNavItems = [mapNavItem(ROUTER_PATHS.HOME, "Dashboard")];

const bottomNavItems = [
  mapNavItem(ROUTER_PATHS.SETTINGS, "Settings"),
  mapNavItem(ROUTER_PATHS.LOGIN, "Logout"),
];

const isLastNavItem = (index: number, arr: NavBtnItem[]) =>
  index === arr.length - 1;

export const SideMenu = () => {
  const user = useUser();
  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "";

  return (
    <Stack gap="xs" h="100%">
      <Group gap="sm" mb="xs">
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
        <div>
          {topNavItems.map(({ to, label }, index) => (
            <NavBtn
              key={to}
              to={to}
              label={label}
              isLast={isLastNavItem(index, topNavItems)}
            />
          ))}
        </div>

        <div>
          {bottomNavItems.map(({ to, label }, index) => (
            <NavBtn
              key={to}
              to={to}
              label={label}
              isLast={isLastNavItem(index, bottomNavItems)}
            />
          ))}
        </div>
      </Stack>
    </Stack>
  );
};
