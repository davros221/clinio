import { UserRole } from "@clinio/shared";
import { useUser } from "./useUser.ts";

export const useUserRole = () => {
  const { user } = useUser();
  const role = user?.role;

  const isClientRole = role === UserRole.CLIENT;
  const hasMandatoryData = Boolean(
    user?.patient?.birthdate &&
      user?.patient?.phone &&
      user?.patient?.birthNumber
  );

  return {
    isClient: isClientRole && hasMandatoryData,
    isOnboardingClient: isClientRole && !hasMandatoryData,
    isNurse: role === UserRole.NURSE,
    isDoctor: role === UserRole.DOCTOR,
    isAdmin: role === UserRole.ADMIN,
    isStaff: role === UserRole.NURSE || role === UserRole.DOCTOR,
  };
};
