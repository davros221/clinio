import { User } from "@clinio/api";
import { UserRole } from "@clinio/shared";

const mapRoleToStr = (role: UserRole) => {
  switch (role) {
    case UserRole.DOCTOR:
      return "Doctor";
    case UserRole.NURSE:
      return "Nurse";
    default:
      return "";
  }
};

export const composeUserName = (user: User, omitRole?: boolean) =>
  `${user.firstName} ${user.lastName}${
    omitRole ? "" : ` (${mapRoleToStr(user.role)})`
  }`;
