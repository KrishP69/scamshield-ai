import en from "./i18n/en.json";
import hi from "./i18n/hi.json";
import mr from "./i18n/mr.json";

export type SupportedLocale = "en" | "hi" | "mr";

export const dictionaries = {
  en,
  hi,
  mr,
};

export function getDictionary(locale: SupportedLocale = "en") {
  return dictionaries[locale] || dictionaries.en;
}
