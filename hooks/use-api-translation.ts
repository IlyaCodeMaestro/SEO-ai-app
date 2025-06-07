"use client"

import { useLanguage } from "@/components/provider/language-provider"

export function useApiTranslation() {
  const { language } = useLanguage()

  const getTranslatedMessage = (output: {
    message_kk?: string
    message_en?: string
    message_ru?: string
    message?: string
  }) => {
    switch (language) {
      case "kz":
        return output.message_kk || output.message || ""
      case "en":
        return output.message_en || output.message || ""
      case "ru":
        return output.message_ru || output.message || ""
      default:
        return output.message || ""
    }
  }

  const getTranslatedText = (texts: {
    text_kk?: string
    text_en?: string
    text_ru?: string
    text?: string
  }) => {
    switch (language) {
      case "kz":
        return texts.text_kk || texts.text || ""
      case "en":
        return texts.text_en || texts.text || ""
      case "ru":
        return texts.text_ru || texts.text || ""
      default:
        return texts.text || ""
    }
  }

  return {
    getTranslatedMessage,
    getTranslatedText,
  }
}
