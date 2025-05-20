"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getTranslation } from "@/lib/translations"

type Language = "kz" | "ru" | "en"

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({
  children,
  defaultLanguage = "ru",
}: {
  children: React.ReactNode
  defaultLanguage?: Language
}) {
  const [language, setLanguage] = useState<Language>(defaultLanguage)

  // Restore language from localStorage on client side
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && ["kz", "ru", "en"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  // Функция для получения перевода
  const t = (key: string): string => {
    return getTranslation(language, key)
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
