const en = {
  common: {
    appName: "ClinIO",
    forbidden: "403 Forbidden",
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
} as const;

export default en;
export type TranslationKeys = typeof en;
