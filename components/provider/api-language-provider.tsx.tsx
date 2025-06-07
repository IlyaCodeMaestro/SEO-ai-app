"use client";

import type React from "react";
import { createContext, useContext } from "react";
import { useLanguage } from "./language-provider";

type ApiLanguageContextType = {
  language: "kz" | "ru" | "en";
  setLanguage: (language: "kz" | "ru" | "en") => void;
  t: (key: string) => string;
  getLanguageId: () => number;
  getApiText: (apiResponse: any, field: string) => string;
};

const ApiLanguageContext = createContext<ApiLanguageContextType | undefined>(
  undefined
);

export function ApiLanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Используем основной LanguageProvider
  const { language, setLanguage, t } = useLanguage();

  // Функция для получения language_id для API запросов
  const getLanguageId = (): number => {
    switch (language) {
      case "kz":
        return 1; // Казахский
      case "en":
        return 2; // Английский
      case "ru":
      default:
        return 3; // Русский
    }
  };

  // Функция для получения переведенного текста из API ответа
  const getApiText = (apiResponse: any, field: string): string => {
    if (!apiResponse) return "";

    // Пытаемся получить переведенный текст в зависимости от текущего языка
    switch (language) {
      case "kz":
        return apiResponse[`${field}_kk`] || apiResponse[field] || "";
      case "en":
        return apiResponse[`${field}_en`] || apiResponse[field] || "";
      case "ru":
      default:
        return apiResponse[`${field}_ru`] || apiResponse[field] || "";
    }
  };

  return (
    <ApiLanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        getLanguageId,
        getApiText,
      }}
    >
      {children}
    </ApiLanguageContext.Provider>
  );
}

export function useApiLanguage() {
  const context = useContext(ApiLanguageContext);
  if (context === undefined) {
    throw new Error(
      "useApiLanguage must be used within an ApiLanguageProvider"
    );
  }
  return context;
}
