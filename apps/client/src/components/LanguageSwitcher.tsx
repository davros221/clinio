import { SegmentedControl } from "@mantine/core";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { value: "en", label: "🇬🇧 EN" },
  { value: "cs", label: "🇨🇿 CS" },
] as const;

export const LanguageSwitcher = () => {
  const { i18n: instance } = useTranslation();

  return (
    <SegmentedControl
      size="xs"
      value={instance.language}
      onChange={(lang) => instance.changeLanguage(lang)}
      data={[...LANGUAGES]}
      aria-label="Language"
    />
  );
};
