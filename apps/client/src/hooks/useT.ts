import { useTranslation } from "react-i18next";

/**
 * Shorthand hook for translations. Replaces `const { t } = useTranslation()`.
 * Components using this will automatically re-render on language change.
 *
 * @example
 * const t = useT();
 * <h1>{t("login.welcome")}</h1>
 */
export const useT = () => useTranslation().t;
