const cs = {
  common: {
    appName: "ClinIO",
    forbidden: "403 Zakázáno",
    forbiddenMessage: "Nemáte oprávnění přistoupit na tuto stránku.",
    returnHome: "Zpět na domovskou stránku",
  },
  login: {
    welcome: "VÍTEJTE!",
    emailLabel: "E-mail / Uživatelské jméno",
    emailPlaceholder: "Váš e-mail/uživatelské jméno",
    passwordLabel: "Heslo",
    passwordPlaceholder: "Vaše heslo",
    submitButton: "Přihlásit se",
    forgotPassword: "Zapomenuté heslo",
    signUp: "Registrace",
  },
  signUp: {
    title: "VYTVOŘIT ÚČET",
    emailLabel: "E-mail",
    emailPlaceholder: "Váš e-mail",
    firstNameLabel: "Jméno",
    firstNamePlaceholder: "Jméno",
    lastNameLabel: "Příjmení",
    lastNamePlaceholder: "Příjmení",
    passwordLabel: "Heslo",
    passwordPlaceholder: "Heslo",
    confirmPasswordLabel: "Potvrdit heslo",
    confirmPasswordPlaceholder: "Potvrdit heslo",
    passwordError:
      "Min. 8 znaků, velká a malá písmena, číslo a speciální znak (@$!%*?&).",
    passwordsMismatch: "Hesla se neshodují",
    submitButton: "Vytvořit účet",
    backToLogin: "Zpět na přihlášení",
    successTitle: "Účet vytvořen!",
    successMessage: "Přihlašujeme vás automaticky, vítejte v Clinio!",
  },
} as const;

export default cs;
