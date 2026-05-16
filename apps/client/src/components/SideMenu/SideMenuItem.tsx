import { useUser } from "@hooks";
import { Badge, Button } from "@mantine/core";
import { NavLink } from "react-router";
import { isLink, SideMenuItemProps } from "./SideMenuItemProps.ts";
import styles from "./SideMenu.module.css";

export const SideMenuItem = (props: SideMenuItemProps) => {
  const { label, badge, allowed, pushToBottom = false } = props;
  const { user } = useUser();

  const canAccess = !allowed || (!!user?.role && allowed.includes(user.role));

  if (!canAccess) {
    return null;
  }

  const shared = {
    mt: pushToBottom ? "auto" : "unset",
    fullWidth: true,
    justify: "space-between" as const,
    className: styles.navLink,
    rightSection: badge && <Badge>{badge}</Badge>,
  };

  if (isLink(props)) {
    return (
      <Button {...shared} component={NavLink} to={props.to} end>
        {label}
      </Button>
    );
  }

  return (
    <Button {...shared} onClick={props.onClick}>
      {label}
    </Button>
  );
};
