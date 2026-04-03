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
    settings: "Nastavení",
    logout: "Odhlásit se",
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
    label: "Ordinace",
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
    start: "Začátek",
    duration: "Trvání",
    minutes: "min",
  },
} as const;

export default cs;
