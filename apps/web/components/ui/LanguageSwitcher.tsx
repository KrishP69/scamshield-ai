"use client";

import React, { useState } from "react";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState("EN");
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "EN", name: "English" },
    { code: "HI", name: "हिन्दी (Hindi)" },
    { code: "MR", name: "मराठी (Marathi)" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-ink/70 dark:text-paper/70 hover:text-ink dark:hover:text-paper hover:bg-paper-200 dark:hover:bg-ink-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine"
        aria-expanded={isOpen}
        aria-label="Select language"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{currentLang}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-ink-800 border border-ink/10 dark:border-paper/10 rounded-lg shadow-lg py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setCurrentLang(lang.code);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-ink/80 dark:text-paper/80 hover:bg-paper-200 dark:hover:bg-ink-700 hover:text-ink dark:hover:text-paper transition-colors"
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
