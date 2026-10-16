"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import en from "./i18n/en.json";
import hi from "./i18n/hi.json";
import mr from "./i18n/mr.json";

export type SupportedLocale = "en" | "hi" | "mr";

export const dictionaries: Record<SupportedLocale, any> = {
  en,
  hi,
  mr,
};

export function getDictionary(locale: SupportedLocale = "en") {
  return dictionaries[locale] || dictionaries.en;
}

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, fallback?: string) => string;
  dict: any;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  dict: en,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("scamshield_locale") as SupportedLocale;
    if (saved && (saved === "en" || saved === "hi" || saved === "mr")) {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("scamshield_locale", newLocale);
        document.documentElement.lang = newLocale;
      } catch {}
    }
  };

  const currentDict = dictionaries[locale] || dictionaries.en;

  const t = (path: string, fallback?: string): string => {
    const keys = path.split(".");
    let current: any = currentDict;
    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k];
      } else {
        // Fallback to English dictionary
        let fallbackVal: any = dictionaries.en;
        for (const fk of keys) {
          if (fallbackVal && typeof fallbackVal === "object" && fk in fallbackVal) {
            fallbackVal = fallbackVal[fk];
          } else {
            return fallback || path;
          }
        }
        return typeof fallbackVal === "string" ? fallbackVal : fallback || path;
      }
    }
    return typeof current === "string" ? current : fallback || path;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dict: currentDict }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
