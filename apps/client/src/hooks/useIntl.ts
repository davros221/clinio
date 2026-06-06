import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { parseISO } from "date-fns";

const diffDays = (a: Date, b: Date) =>
  Math.round((a.getTime() - b.getTime()) / 86_400_000);

export const DateTimeFormats = {
  DATE: { day: "2-digit", month: "2-digit", year: "numeric" },
  DATE_LONG: { day: "numeric", month: "long", year: "numeric" },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

// Monday 2024-01-01 used as anchor for getDayName (dayIdx 0 = Monday)
const ANCHOR_MONDAY = new Date(2024, 0, 1);

const toDate = (date: Date | string): Date =>
  typeof date === "string" ? parseISO(date) : date;

export const useIntl = () => {
  const { i18n, t } = useTranslation();
  const locale = i18n.language;

  const formatDateTime = useCallback(
    (
      date: Date | string,
      format: Intl.DateTimeFormatOptions = DateTimeFormats.DATE
    ) => new Intl.DateTimeFormat(locale, format).format(toDate(date)),
    [locale]
  );

  const getDayName = useCallback(
    (dayIdx: number): string => {
      const date = new Date(ANCHOR_MONDAY);
      date.setDate(ANCHOR_MONDAY.getDate() + dayIdx);
      return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date);
    },
    [locale]
  );

  const getRelativeDayLabel = useCallback(
    (date: Date): string | null => {
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diff = diffDays(normalized, today);
      if (diff === 0) return t("calendar.today");
      if (diff === 1) return t("calendar.tomorrow");
      if (diff === 2) return t("calendar.dayAfterTomorrow");
      return null;
    },
    [t]
  );

  return { formatDateTime, getDayName, getRelativeDayLabel };
};
