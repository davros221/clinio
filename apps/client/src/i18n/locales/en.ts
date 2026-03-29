const en = {
  common: {
    appName: "ClinIO",
    forbidden: "Forbidden",
    forbiddenMessage: "You do not have permission to access this page.",
    returnHome: "Go Back Home",
  },
  login: {
    welcome: "WELCOME!",
    emailLabel: "Email / Username",
    emailPlaceholder: "Your e-mail/username",
    passwordLabel: "Password",
    passwordPlaceholder: "Your Password",
    submitButton: "Let me In",
    forgotPassword: "Forgot password",
    signUp: "Sign Up",
  },
  signUp: {
    title: "CREATE ACCOUNT",
    emailLabel: "Email",
    emailPlaceholder: "Your e-mail",
    firstNameLabel: "First Name",
    firstNamePlaceholder: "First name",
    lastNameLabel: "Last Name",
    lastNamePlaceholder: "Last name",
    passwordLabel: "Password",
    passwordPlaceholder: "Password",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm password",
    passwordError:
      "Min 8 chars, upper & lowercase, number, and special character (@$!%*?&).",
    passwordsMismatch: "Passwords do not match",
    submitButton: "Create Account",
    backToLogin: "Back to Login",
    successTitle: "Account created!",
    successMessage: "Logging you in automatically, welcome to Clinio!",
  },
  dataTable: {
    actionsColumn: "Actions",
    emptyFallback: "No records",
    errorFallback: "Failed to load data",
  },
  quickActions: {
    offices: "Offices",
    officesDescription: "Office list",
    patients: "Patients",
    patientsDescription: "Patient list",
    newAppointment: "New Appointment",
    newAppointmentDescription: "Add record",
    show: "Show",
    add: "Add",
  },
  calendar: {
    today: "Today",
  },
  nurseDashboard: {
    title: "Welcome back!",
  },
  offices: {
    title: "Office List",
    emptyMessage: "No offices to display",
    days: {
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
      sunday: "Sun",
    },
    columns: {
      name: "Name",
      specialization: "Specialization",
      address: "Address",
      officeHoursTemplate: "Office Hours",
    },
    actions: {
      detail: "Detail",
    },
  },
  patients: {
    title: "Patient List",
    emptyMessage: "No patients to display",
    columns: {
      lastName: "Last Name",
      firstName: "First Name",
      birthNumber: "Birth Number",
      birthDate: "Date of Birth",
      phone: "Phone",
      email: "Email",
    },
    actions: {
      detail: "Detail",
      book: "Book",
    },
  },
  appointments: {
    errorLoadingAppointments: "Failed to load appointments",
  },
} as const;

export default en;
export type TranslationKeys = typeof en;
