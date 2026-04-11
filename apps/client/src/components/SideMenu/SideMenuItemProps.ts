import { UserRole } from "@clinio/shared";

type SideMenuItemBase = {
  label: string;
  pushToBottom?: boolean;
  /**
   * List of allowed roles.
   * When the array is not defined, all roles are allowed
   */
  allowed?: UserRole[];
};

type SideMenuLink = SideMenuItemBase & {
  to: string;
};

type SideMenuButton = SideMenuItemBase & {
  onClick: () => void;
};

export type SideMenuItemProps = SideMenuLink | SideMenuButton;

export const isLink = (props: SideMenuItemProps): props is SideMenuLink =>
  "to" in props;
