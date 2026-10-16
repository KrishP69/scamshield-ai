"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useI18n, SupportedLocale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const languages: { code: SupportedLocale; name: string }[] = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिन्दी (Hindi)" },
    { code: "mr", name: "मराठी (Marathi)" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-ink/80 dark:text-paper/80 hover:text-ink dark:hover:text-paper hover:bg-paper-200 dark:hover:bg-ink-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine"
        aria-expanded={isOpen}
        aria-label="Select language"
      >
        <Globe className="w-3.5 h-3.5 text-ultramarine dark:text-cyan-400" />
        <span className="uppercase tracking-wider">{locale || "EN"}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          {languages.map((lang) => {
            const isSelected = locale === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLocale(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                  isSelected
                    ? "font-bold text-ultramarine dark:text-cyan-400 bg-ultramarine/5 dark:bg-cyan-950/20"
                    : "text-ink/80 dark:text-paper/80 hover:bg-paper-200 dark:hover:bg-ink-700 hover:text-ink dark:hover:text-paper"
                }`}
              >
                <span>{lang.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-ultramarine dark:text-cyan-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
