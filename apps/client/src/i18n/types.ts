import type { TranslationKeys } from "./locales/en";

export {}; // make this a module

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: TranslationKeys;
    };
  }
}
