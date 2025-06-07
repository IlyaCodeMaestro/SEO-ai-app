"use client"

import type React from "react"
import { createContext, useState, useEffect } from "react"
import i18next from "i18next"
import { useTranslation } from "react-i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import HttpApi from "i18next-http-backend"

// Define the Language type
export type Language = "en" | "ru" | "kz"

// Create the Language context
type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
  languageId: number
}

const LanguageContext = createContext<LanguageContextType>({
  language: "ru",
  setLanguage: () => {},
  t: (key: string) => key,
  languageId: 3,
})

// Export the Language context
export { LanguageContext }

// Create the Language provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the useTranslation hook
  const { t } = useTranslation()

  // Use the useState hook to store the current language
  const [language, setLanguage] = useState<Language>("ru")

  // Use the useEffect hook to initialize i18next
  useEffect(() => {
    i18next
      .use(initReactI18next) // passes i18next down to react-i18next
      .use(LanguageDetector)
      .use(HttpApi)
      .init({
        supportedLngs: ["en", "ru", "kz"],
        fallbackLng: "ru",
        detection: {
          order: ["cookie", "localStorage", "sessionStorage", "navigator", "htmlTag", "path", "subdomain"],
          caches: ["cookie", "localStorage"],
        },
        backend: {
          loadPath: "/assets/locales/{{lng}}/translation.json",
        },
      })
  }, [])

  // Use the useEffect hook to change the language when the language state changes
  useEffect(() => {
    i18next.changeLanguage(language)
  }, [language])

  // Добавляем функцию для преобразования языка в language_id
  const getLanguageId = (lang: Language): number => {
    switch (lang) {
      case "kz":
        return 1 // казахский
      case "en":
        return 2 // английский
      case "ru":
        return 3 // русский
      default:
        return 3 // по умолчанию русский
    }
  }

  // В компоненте LanguageProvider добавляем languageId в контекст
  const languageId = getLanguageId(language)

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageId }}>{children}</LanguageContext.Provider>
  )
}
