import { useUser } from "../../hooks/useUser.ts";
import { Button } from "@mantine/core";
import { NavLink } from "react-router";
import { isLink, SideMenuItemProps } from "./SideMenuItemProps.ts";
import styles from "./SideMenu.module.css";

export const SideMenuItem = (props: SideMenuItemProps) => {
  const { label, allowed, pushToBottom = false } = props;
  const { user } = useUser();

  const canAccess = !allowed || (!!user?.role && allowed.includes(user.role));

  if (!canAccess) {
    return null;
  }

  const shared = {
    mt: pushToBottom ? "auto" : "unset",
    fullWidth: true,
    justify: "start" as const,
    className: styles.navLink,
  };

  if (isLink(props)) {
    return (
      <Button {...shared} component={NavLink} to={props.to}>
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
