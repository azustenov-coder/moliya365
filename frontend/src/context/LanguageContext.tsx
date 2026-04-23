"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { dictionary } from "../locales";

type Language = "uz" | "ru" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  cycleLang: () => void;
  t: (keyPath: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("uz");

  useEffect(() => {
    const savedLang = localStorage.getItem("finance_lang") as Language;
    if (savedLang && ["uz", "ru", "en"].includes(savedLang)) {
      setLang(savedLang);
    }
  }, []);

  const changeLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("finance_lang", newLang);
  };

  const cycleLang = () => {
    if (lang === "uz") changeLang("ru");
    else if (lang === "ru") changeLang("en");
    else changeLang("uz");
  };

  const t = (keyPath: string): string => {
    const keys = keyPath.split(".");
    let value: any = dictionary[lang];
    for (const key of keys) {
      if (value === undefined) return keyPath;
      value = value[key];
    }
    return value || keyPath;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, cycleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
