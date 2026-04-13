import { useUser } from "@hooks";
import { UserRole } from "@clinio/shared";
import { ReactNode } from "react";

type Props = {
  roles: UserRole[];
  fallback?: ReactNode;
  children: ReactNode;
};

export const RoleGuard = (props: Props) => {
  const { roles, fallback, children } = props;
  const { user } = useUser();

  const hasAccess = !!user && roles.includes(user.role);
  return hasAccess ? children : fallback ?? null;
};
