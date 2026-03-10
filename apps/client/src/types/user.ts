// TODO: Mocked types, should be taken from the shared types dir once BE sets it up
export const USER_ROLES = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  NURSE: "nurse",
  CLIENT: "client",
} as const;

export type UserRoleType = (typeof USER_ROLES)[keyof typeof USER_ROLES];
