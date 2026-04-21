export const ROUTER_PATHS = {
  HOME: "/",
  LOGIN: "/login",
  SIGN_UP: "/sign-up",
  RESET_PASSWORD: "/reset-password",
  ACTIVATE_EMAIL: "/activate",
  PATIENTS: "/patients",
  PATIENT_DETAIL: "/patients/:id",
  PATIENT_DETAIL_ID: (id: string) => `/patients/${id}`,
  FORBIDDEN: "/forbidden",
  SETTINGS: "/settings",
  OFFICES: "/offices",
  APPOINTMENTS: "/appointments",
} as const;
