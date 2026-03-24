import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en";
import cs from "./locales/cs";

// Side-effect import: loads the type augmentation so i18next types are applied globally
import "./types";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: "en",
    fallbackLng: "en",
    resources: {
      en: { translation: en },
      cs: { translation: cs },
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;

/**
 * Use this outside React components (utilities, services, stores).
 * For components, use the `useT` hook so re-renders happen on language change.
 */
export const t = i18n.t.bind(i18n);
