const cs = {
  common: {
    appName: "ClinIO",
    forbidden: "Zakázáno",
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
  dataTable: {
    actionsColumn: "Akce",
    emptyFallback: "Žádné záznamy",
    errorFallback: "Nepodařilo se načíst data",
  },
  quickActions: {
    offices: "Ordinace",
    officesDescription: "Seznam ordinací",
    patients: "Pacienti",
    patientsDescription: "Seznam pacientů",
    newAppointment: "Nová schůzka",
    newAppointmentDescription: "Přidat záznam",
    show: "Zobrazit",
    add: "Přidat",
  },
  calendar: {
    today: "Dnes",
  },
  nurseDashboard: {
    title: "Vítejte zpět!",
  },
  offices: {
    title: "Seznam ordinací",
    emptyMessage: "Žádné ordinace k zobrazení",
    days: {
      monday: "Po",
      tuesday: "Út",
      wednesday: "St",
      thursday: "Čt",
      friday: "Pá",
      saturday: "So",
      sunday: "Ne",
    },
    columns: {
      name: "Název",
      specialization: "Specializace",
      address: "Adresa",
      officeHoursTemplate: "Ordinační hodiny",
    },
    actions: {
      detail: "Detail",
    },
  },
  patients: {
    title: "Seznam pacientů",
    emptyMessage: "Žádní pacienti k zobrazení",
    columns: {
      lastName: "Příjmení",
      firstName: "Jméno",
      birthNumber: "Rodné číslo",
      birthDate: "Datum narození",
      phone: "Telefon",
      email: "Email",
    },
    actions: {
      detail: "Detail",
      book: "Objednat",
    },
  },
  appointments: {
    errorLoadingAppointments: "Nepodařilo se načíst schůzky",
  },
} as const;

export default cs;
