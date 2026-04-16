import { ErrorCode } from "@clinio/shared";

const en = {
  common: {
    action: {
      save: "Save",
      delete: "Delete",
      cancel: "Cancel",
      activate: "Activate",
    },
    appName: "ClinIO",
    auth: {
      accountNotActive: "Your account exists, but it's not activated yet",
      sendResetLink: "Send password reset link",
      emailSent: {
        title: "Reset link sent",
        message:
          "A password reset link has been sent to your email. Check your email and set your password.",
      },
      passwordReset: {
        title: "Password set",
        message: "Your password has been set successfully",
      },
      email: "Email",
      password: "Password",
      passwordConfirmation: "Password confirmation",
      resetPassword: "Reset password",
      sendEmailButton: "Send",
      emailSentButton: "Email sent",
      confirmPassword: "Confirm password",
    },
    error: {
      general: "Error",
      noData: "No data available",
      createFailed: "Failed to create",
      deleteFailed: "Failed to delete",
      updateFailed: "Failed to update",
      ...({
        [ErrorCode.INTERNAL_SERVER_ERROR]: "A server error occurred",
        [ErrorCode.INVALID_CREDENTIALS]: "Invalid email or password",
        [ErrorCode.UNAUTHORIZED]: "You need to log in",
        [ErrorCode.FORBIDDEN]: "You don't have permission",
        [ErrorCode.NOT_FOUND]: "Resource not found",
        [ErrorCode.USER_NOT_FOUND]: "User could not be found",
        [ErrorCode.EMAIL_ALREADY_EXISTS]: "This email is already in use",
        [ErrorCode.OFFICE_NOT_FOUND]: "Office not found",
        [ErrorCode.APPOINTMENT_NOT_FOUND]: "Appointment not found",
        [ErrorCode.BAD_REQUEST]: "Invalid request",
        [ErrorCode.PATIENT_NOT_FOUND]: "Patient not found",
        [ErrorCode.ACCOUNT_NOT_ACTIVE]: "Account is not active",
        [ErrorCode.INVALID_RESET_TOKEN]: "Invalid reset token",
        [ErrorCode.RESET_TOKEN_EXPIRED]: "Reset token has expired",
        [ErrorCode.APPOINTMENT_SLOT_TAKEN]:
          "This appointment slot is already taken",
        [ErrorCode.APPOINTMENT_OUTSIDE_HOURS]:
          "Appointment is outside office hours",
      } satisfies Record<ErrorCode, string>),
    },
    forbidden: "Forbidden",
    forbiddenMessage: "You do not have permission to access this page.",
    returnHome: "Go Back Home",
    time: {
      daysShort: {
        monday: "MON",
        tuesday: "TUE",
        wednesday: "WED",
        thursday: "THU",
        friday: "FRI",
        saturday: "SAT",
        sunday: "SUN",
      },
    },
    validation: {
      required: "required",
      email: "invalid email address",
      phone: "invalid phone number format (+420111222333)",
      datePast: "date cannot be in the past",
      dateFuture: "date cannot be in the future",
      birthNumberLength: "Birth number must be exactly 10 digits",
    },
  },
  component: {
    dataTable: {
      emptyText: "No data available",
      errorFallback: "An error occurred while loading data",
      actionsColumn: "Actions",
    },
  },
  nav: {
    dashboard: "Dashboard",
    offices: "Offices",
    appointments: "Appointments",
    patients: "Patients",
    staff: "Staff",
    settings: "Settings",
    logout: "Logout",
  },
  appointment: {
    createModal: {
      title: "New Appointment",
      fields: {
        office: "Office",
        officePlaceholder: "Select office",
        patient: "Patient",
        patientPlaceholder: "Select patient",
        date: "Date",
        time: "Time",
        timePlaceholder: "Select time slot",
        note: "Note",
        notePlaceholder: "Optional note",
      },
      buttons: {
        cancel: "Cancel",
        submit: "Book",
      },
    },
    overview: {
      title: "Appointments",
      table: {
        date: "Date",
        time: "Time",
        status: "Status",
        office: "Office",
        note: "Note",
      },
    },
    status: {
      planned: "Planned",
      completed: "Completed",
      cancelled: "Cancelled",
    },
    notification: {
      createSuccess: "Appointment created",
    },
  },
  login: {
    welcome: "WELCOME!",
    emailLabel: "Email / Username",
    emailPlaceholder: "Your e-mail/username",
    passwordLabel: "Password",
    passwordPlaceholder: "Your Password",
    submitButton: "Let me In",
    login: "Login",
    forgotPassword: "Forgot password",
    signUp: "Sign Up",
  },
  office: {
    createOfficeModal: {
      title: {
        create: "Create new office",
        detail: "Office details",
      },
      sections: {
        basicInfo: "Basic Information",
        hours: "Office Hours",
        personnel: "Personnel",
      },
      fields: {
        name: "Name",
        namePlaceholder: "Nováková Dental Clinic",
        specialization: "Specialization",
        specializationPlaceholder: "Stomatology",
        address: "Address",
        addressPlaceholder: "Corner Street 616/1, Prague",
        user: "User",
        userPlaceholder: "email@example.com",
        role: "Role",
        rolePlaceholder: "Nurse / Doctor",
      },
      table: {
        open: "Open",
        day: "Day",
        from: "From",
        to: "To",
        role: "Role",
        actions: "Actions",
        remove: "Remove",
        add: "Add",
      },
      buttons: {
        cancel: "Cancel",
        submit: "Create",
      },
    },
    deleteModal: {
      title: "Delete office",
      message:
        "Are you sure you want to delete this office? This action is permanent and cannot be undone.",
      confirm: "Delete",
      cancel: "Cancel",
    },
    overview: {
      officesListHeader: {
        action: "Action",
        name: "Name",
        specialization: "Specialization",
        address: "Address",
        officeHours: "Office Hours",
      },
      title: "Offices Overview",
    },
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
    birthNumberLabel: "Birth Number",
    birthNumberPlaceholder: "Birth number",
    birthdateLabel: "Date of Birth",
    birthdatePlaceholder: "Date of birth",
    phoneLabel: "Phone",
    phonePlaceholder: "Phone number",
  },
  user: {
    roles: {
      nurse: "Nurse",
      doctor: "Doctor",
      client: "Patient",
      admin: "Admin",
      staff: "Staff",
    },
    form: {
      title: "New User",
      role: "Role",
      password: "Password",
      submit: "Create User",
    },
    notification: {
      createSuccessTitle: "Done!",
      createSuccessMessage: "User was successfully created.",
    },
  },
  calendar: {
    today: "Today",
  },
  patient: {
    overview: {
      title: "Patients",
    },
    form: {
      title: "New Patient",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      birthNumber: "Birth Number",
      birthdate: "Date of Birth",
      phone: "Phone",
      submit: "Create Patient",
      password: "Password",
      passwordConfirm: "Confirm Password",
      role: "Role",
    },
    notification: {
      createSuccessTitle: "Done!",
      createSuccessMessage: "Patient was successfully created.",
    },
  },
} as const;

export default en;

type DeepString<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepString<T[K]> : string;
};

export type TranslationKeys = DeepString<typeof en>;
