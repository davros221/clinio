import { ErrorCode } from "@clinio/shared";
import { TranslationKeys } from "./en";

const cs: TranslationKeys = {
  common: {
    action: {
      save: "Uložit",
      delete: "Smazat",
    },
    appName: "ClinIO",
    error: {
      noData: "Žádná data nejsou k dispozici",
      createFailed: "Vytvoření se nezdařilo",
      deleteFailed: "Smazání se nezdařilo",
      updateFailed: "Aktualizace se nezdařila",
      ...({
        [ErrorCode.INTERNAL_SERVER_ERROR]: "Došlo k chybě serveru",
        [ErrorCode.INVALID_CREDENTIALS]: "Neplatný e-mail nebo heslo",
        [ErrorCode.UNAUTHORIZED]: "Musíte se přihlásit",
        [ErrorCode.FORBIDDEN]: "Nemáte dostatečná oprávnění",
        [ErrorCode.NOT_FOUND]: "Zdroj nebyl nalezen",
        [ErrorCode.USER_NOT_FOUND]: "Uživatel nebyl nalezen",
        [ErrorCode.EMAIL_ALREADY_EXISTS]: "Tento e-mail se již používá",
        [ErrorCode.OFFICE_NOT_FOUND]: "Ordinace nebyla nalezena",
        [ErrorCode.APPOINTMENT_NOT_FOUND]: "Schůzka nebyla nalezena",
        [ErrorCode.BAD_REQUEST]: "Neplatný požadavek",
        [ErrorCode.PATIENT_NOT_FOUND]: "Pacient nebyl nalezen",
        [ErrorCode.ACCOUNT_NOT_ACTIVE]: "Účet není aktivní",
        [ErrorCode.ACCOUNT_ALREADY_ACTIVATED]: "Účet je již aktivován",
        [ErrorCode.INVALID_ACTIVATION_TOKEN]: "Neplatný aktivační token",
        [ErrorCode.ACTIVATION_TOKEN_EXPIRED]:
          "Platnost aktivačního tokenu vypršela",
        [ErrorCode.APPOINTMENT_SLOT_TAKEN]: "Tento termín je již obsazen",
        [ErrorCode.APPOINTMENT_OUTSIDE_HOURS]:
          "Termín je mimo ordinační hodiny",
      } satisfies Record<ErrorCode, string>),
    },
    forbidden: "Zakázáno",
    forbiddenMessage: "Nemáte oprávnění přistoupit na tuto stránku.",
    returnHome: "Zpět na domovskou stránku",
    time: {
      daysShort: {
        monday: "PO",
        tuesday: "ÚT",
        wednesday: "ST",
        thursday: "ČT",
        friday: "PÁ",
        saturday: "SO",
        sunday: "NE",
      },
    },
    validation: {
      required: "povinné pole",
      datePast: "datum nemůže být v minulosti",
      birthNumberLength: "Rodné číslo musí mít přesně 10 číslic",
    },
  },
  component: {
    dataTable: {
      emptyText: "Žádná data k zobrazení",
      errorFallback: "Při načítání dat došlo k chybě",
      actionsColumn: "Akce",
    },
  },
  nav: {
    dashboard: "Přehled",
    offices: "Ordinace",
    appointments: "Rezervace",
    settings: "Nastavení",
    logout: "Odhlásit se",
  },
  appointment: {
    createModal: {
      title: "Nová rezervace",
      fields: {
        office: "Ordinace",
        officePlaceholder: "Vyberte ordinaci",
        patient: "Pacient",
        patientPlaceholder: "Vyberte pacienta",
        date: "Datum",
        time: "Čas",
        timePlaceholder: "Vyberte časový slot",
        note: "Poznámka",
        notePlaceholder: "Volitelná poznámka",
      },
      buttons: {
        cancel: "Zrušit",
        submit: "Rezervovat",
      },
    },
    overview: {
      title: "Rezervace",
      table: {
        date: "Datum",
        time: "Čas",
        status: "Stav",
        office: "Ordinace",
        note: "Poznámka",
      },
    },
    status: {
      planned: "Naplánováno",
      completed: "Uskutečněno",
      cancelled: "Zrušeno",
    },
    notification: {
      createSuccess: "Rezervace byla vytvořena",
    },
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
  office: {
    createOfficeModal: {
      title: {
        create: "Vytvořit novou ordinaci",
        detail: "Detail ordinace",
      },
      sections: {
        basicInfo: "Základní informace",
        hours: "Ordinační hodiny",
        personnel: "Personál",
      },
      fields: {
        name: "Název",
        namePlaceholder: "Zubní ordinace Nováková",
        specialization: "Specializace",
        specializationPlaceholder: "Stomatologie",
        address: "Adresa",
        addressPlaceholder: "Za rohem 616/1, Liberec",
        user: "Uživatel",
        userPlaceholder: "email@example.com",
        role: "Role",
        rolePlaceholder: "Sestra / Lékař",
      },
      table: {
        open: "Otevřeno",
        day: "Den",
        from: "Od",
        to: "Do",
        role: "Role",
        actions: "Akce",
        remove: "Odebrat",
        add: "Přidat",
      },
      buttons: {
        cancel: "Zrušit",
        submit: "Vytvořit",
      },
    },
    deleteModal: {
      title: "Smazat ordinaci",
      message: "Opravdu chcete tuto ordinaci smazat? Tato akce je nevratná.",
      confirm: "Smazat",
      cancel: "Zrušit",
    },
    overview: {
      officesListHeader: {
        action: "Akce",
        name: "Název",
        specialization: "Specializace",
        address: "Adresa",
        officeHours: "Ordinační hodiny",
      },
      title: "Přehled ordinací",
    },
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
    birthNumberLabel: "Rodné číslo",
    birthNumberPlaceholder: "Rodné číslo",
    birthdateLabel: "Datum narození",
    birthdatePlaceholder: "Datum narození",
    phoneLabel: "Telefon",
    phonePlaceholder: "Telefonní číslo",
  },
  patient: {
    form: {
      title: "Nový pacient",
      firstName: "Jméno",
      lastName: "Příjmení",
      email: "Email",
      birthNumber: "Rodné číslo",
      birthdate: "Datum narození",
      phone: "Telefon",
      submit: "Založit pacienta",
    },
    notification: {
      createSuccessTitle: "Hotovo!",
      createSuccessMessage: "Pacient byl úspěšně vytvořen.",
    },
  },
} as const;

export default cs;
