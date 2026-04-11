import { UserRole } from "@clinio/shared";
import { useUser } from "./useUser.ts";

export const useUserRole = () => {
  const role = useUser()?.role;
  return {
    isClient: role === UserRole.CLIENT,
    isNurse: role === UserRole.NURSE,
    isDoctor: role === UserRole.DOCTOR,
    isAdmin: role === UserRole.ADMIN,
    isStaff: role === UserRole.NURSE || role === UserRole.DOCTOR,
  };
};
