import { USER_ROLES, type UserRoleType } from "../types/user";

// TODO: Replace with actual authentication logic
// This should probably come from a store or context
export const useAuth = () => {
  const isLoggedIn = false;
  // We cast to UserRoleType to simulate that it could be any role at runtime
  const userRole = USER_ROLES.CLIENT as UserRoleType;

  return {
    isAuthenticated: isLoggedIn,
    userRole,
    user: {
      role: userRole,
    },
  };
};
